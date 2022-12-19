import React from "react";
import { Layout, Menu } from "antd";

const { Header } = Layout;

const AppHeader = () => {
  return (
    <Header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1,
        width: "100%",
        background: "#fff",
        borderBottom: "1px solid #e8e8e8",
        boxShadow: "0 1px 4px rgba(0,21,41,.08)",
      }}
    >
      <div
        className="logo"
        style={{
          float: "left",
          width: 50,
          height: 50,
          margin: "0.5rem 24px 16px 0",
          backgroundImage: "url(/class-notes/logo.png)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      />
      <Menu
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          pointerEvents: "none",
        }}
        theme="light"
        mode="horizontal"
        items={[{ key: 1, label: "  Class Notes" }]}
      />
    </Header>
  );
};

export default AppHeader;
