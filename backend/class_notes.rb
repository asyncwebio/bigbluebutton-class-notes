#!/usr/bin/ruby
# encoding: UTF-8

# post-publish script for BigBlueButton that would run after a class ends and it's recording is processed

require "optimist"
require "psych"
require "json"
require "net/http"
require "openssl"
require "fileutils"
require "bbbevents"
require File.expand_path("../../../lib/recordandplayback", __FILE__)

opts = Optimist::options do
  opt :meeting_id, "Meeting id for class notes", :type => String
end
meeting_id = opts[:meeting_id]

logger = Logger.new("/var/log/bigbluebutton/post_publish.log", "weekly")
logger.level = Logger::INFO
BigBlueButton.logger = logger

if !File.exist?(File.join(__dir__, "./class_notes_config.yml"))
  BigBlueButton.logger.info("Unable to find the config file. Please create a config file with the name #{File.join(__dir__, "class_notes_config.yml")}}")
  exit 0
end
config = Psych.load_file(File.join(__dir__, "class_notes_config.yml"))

assembly_ai_api_key = config["assembly_ai_api_key"]
bbb_url = config["bbb_url"]
video_format = config["bbb_playback_video_format"]
events_dir = config["bbb_event_dir"]

recording_path = "/var/bigbluebutton/published/presentation/#{meeting_id}"
webcams_file_path = "#{recording_path}/video"
class_notes_file = "#{recording_path}/class_notes.json"
vtt_file = "#{recording_path}/captions.vtt"

events_xml_path = "#{events_dir}/#{meeting_id}/events.xml"
is_event_xml_exist = File.exist?(events_xml_path)

if !is_event_xml_exist
  BigBlueButton.logger.info("Unable to find the events.xml file. Please check if the events.xml file exists at #{events_xml_path}")
  exit 0
end

events_data = BBBEvents.parse(events_xml_path)

if config["trigger_mode"] == "metadata" && events_data.metadata["class_notes_enabled"] != "true"
  BigBlueButton.logger.info("Class notes not enabled for #{meeting_id}")
  exit 0
end

def http_client(uri, method, body = nil, assembly_ai_api_key)
  uri = URI(uri)
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  request = ""
  if method == "post"
    request = Net::HTTP::Post.new(
      uri,
      "authorization" => assembly_ai_api_key,
      "content-type" => "application/json",
    )
  end
  if method == "get"
    request = Net::HTTP::Get.new(
      uri,
      "authorization" => assembly_ai_api_key,
      "content-type" => "application/json",
    )
  end

  if !body.nil?
    request.body = body.to_json
  end

  response = http.request(request)
  return response
end

begin
  ffmped_cmd = "ffmpeg -y -i #{webcams_file_path}/webcams.#{video_format} -vn -acodec pcm_s16le -ar 44100 -ac 2 #{webcams_file_path}/audio.wav"

  status = system(ffmped_cmd)
  if status
    assemblyai_options = {
      "audio_url" => "#{bbb_url}/presentation/#{meeting_id}/video/audio.wav",
      "summarization" => true,
      "summary_type" => "bullets",
      "summary_model" => "informative",
      "punctuate" => true,
      "format_text" => true,
      "iab_categories" => true,
      "speaker_labels" => true,
      "sentiment_analysis" => true,
    }

    response = http_client("https://api.assemblyai.com/v2/transcript", "post", assemblyai_options, assembly_ai_api_key)

    transcript_id = JSON.parse(response.body)["id"]

    # poll for the transcription
    is_transcription_done = false

    while !is_transcription_done
      response = http_client("https://api.assemblyai.com/v2/transcript/#{transcript_id}", "get", body = nil, assembly_ai_api_key)
      transcription_data = JSON.parse(response.body)

      if transcription_data["status"] == "error"
        raise "Unable to get the transcription!"
      end

      if transcription_data["status"] == "completed"
        BigBlueButton.logger.info("Transcription in completed for #{meeting_id}")
        is_transcription_done = true

        # Download vtt file
        response = http_client("https://api.assemblyai.com/v2/transcript/#{transcript_id}/vtt", "get", body = nil, assembly_ai_api_key)
        FileUtils.touch(vtt_file) if !File.file? (vtt_file)
        File.write(vtt_file, response.read_body)

        # Save the transcription data in a json file
        data_to_write =
          {
            "meeting_name" => events_data.metadata["meetingName"],
            "start_time" => events_data.start,
            "transcript" => transcription_data["text"],
            "summary" => transcription_data["summary"],
            "speaker_labels" => transcription_data["utterances"],
            "sentiment_analysis_results" => transcription_data["sentiment_analysis_results"],
          }

        if transcription_data["iab_categories_result"]["status"] == "success"
          data_to_write["topics"] = transcription_data["iab_categories_result"]
        end
        FileUtils.touch(class_notes_file) if !File.file? (class_notes_file)
        File.write(class_notes_file, data_to_write.to_json)
      end
      sleep(5)
    end

    exit 0
  end
rescue => exception
  BigBlueButton.logger.info("Error: #{exception}")
  exit 0
end
