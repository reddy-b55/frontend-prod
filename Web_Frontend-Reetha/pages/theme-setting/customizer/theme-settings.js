import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import config from "./config.json";

const ThemeSettings = () => {

  const [themeLayout, setThemeLayout] = useState(false);

  useEffect(() => {
    try {


      if (config.config.layout_version && config.config.layout_type) {
        const bodyClass = document.body.classList;
        document.body.className = `${bodyClass} ${config.config.layout_version}  ${config.config.layout_type}`;
      }
      if (localStorage.getItem("color")) {
        document.documentElement.style.setProperty(
          "--theme-deafult",
          localStorage.getItem("color")
        );
      }
      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    } catch (error) {
      window.location.reload();
    }
  }, []);

  const handleScroll = () => {
    try {
      if (process.browser) {
        if (document.documentElement.scrollTop > 600) {
          document.querySelector(".tap-top").style = "display: block";
        } else {
          document.querySelector(".tap-top").style = "display: none";
        }
      }
    } catch (error) {
      window.location.reload();
    }
  };
  if (themeLayout) {
    if (process.browser) {
      document.body.classList.add("dark");
      config.config.layout_version = "dark";
    }
  } else {
    if (process.browser) {
      document.body.classList.remove("dark");
      config.config.layout_version = "light";
    }
  }
  return (
    <div>
      <ToastContainer />
    </div>
  );

};

export default ThemeSettings;
