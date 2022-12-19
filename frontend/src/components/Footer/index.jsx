import React from "react";
import { Layout } from "antd";

const { Footer } = Layout;

const AppFooter = () => {
  return (
    <Footer style={{ textAlign: "center" }}>
      <a href="https://higheredlab.com" target={"_blank"} rel="noreferrer">
        AsyncWeb Technologies
      </a>
    </Footer>
  );
};

export default AppFooter;
