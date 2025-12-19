import React, { useEffect, useState, useContext } from "react";
import Link from "next/link";
import { ToastContainer } from "react-toastify";
import {
  Media,
  Col,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Collapse,
} from "reactstrap";
import SettingContext from "../../helpers/theme-setting/SettingContext";
import config from "./config.json";

const ThemeSettings = () => {
  const [isOpen, setIsOpen] = useState();
  const [collapse, setCollapse] = useState(0);
  const context = useContext(SettingContext);
  const [themeLayout, setThemeLayout] = useState(false);
  const layoutType = context.layoutFun;
  const layoutColorFunc = context.layoutColorFun;
  const layoutColor = context.layoutColor;
  const layoutState = context.layoutState;
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);

  /*=====================
     Tap on Top
     ==========================*/
  useEffect(() => {
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
  }, []);

  const handleScroll = () => {
    if (process.browser) {
      if (document.documentElement.scrollTop > 600) {
        document.querySelector(".tap-top").style = "display: block";
      } else {
        document.querySelector(".tap-top").style = "display: none";
      }
    }
  };

  const openSetting = () => {
    if (process.browser) {
      document.getElementById("setting_box").classList.add("open-setting");
      document.getElementById("setting-icon").classList.add("open-icon");
    }
  };

  const closeSetting = () => {
    if (process.browser) {
      document.getElementById("setting_box").classList.remove("open-setting");
      document.getElementById("setting-icon").classList.remove("open-icon");
    }
  };

  const changeThemeLayout = () => {
    setThemeLayout(!themeLayout);
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

  const LayoutData = [
    {
      bg: "demo1",
      name: "Fashion",
      link: "/",
      btnName: "Preview",
    },
    {
      bg: "demo21",
      ribon: true,
      name: "furniture",
      link: "/layouts/Furniture",
      btnName: "Preview",
    },
    {
      bg: "demo7",
      ribon: true,
      name: "kids",
      link: "/layouts/Kids",
      btnName: "Preview",
    },
    {
      bg: "demo48",
      ribon: true,
      name: "pets",
      link: "/layouts/Pets",
      btnName: "Preview",
    },
    {
      bg: "demo10",
      ribon: true,
      name: "vegetables",
      link: "/layouts/Vegetables",
      btnName: "Preview",
    },
    {
      bg: "demo6",
      ribon: true,
      name: "watch",
      link: "/layouts/Watch",
      btnName: "Preview",
    },
    {
      bg: "demo11",
      ribon: true,
      name: "beauty",
      link: "/layouts/Beauty",
      btnName: "Preview",
    },
    {
      bg: "demo16",
      ribon: true,
      name: "electronics",
      link: "/layouts/Electronic/Electronic-1",
      btnName: "Preview",
    },
  ];

  const ShopData = [
    {
      bg: "demo22",
      name: "left sidebar",
      link: "/shop/left_sidebar",
      btnName: "Preview",
    },
    {
      bg: "demo24",
      name: "right sidebar",
      link: "/shop/right_sidebar",
      btnName: "Preview",
    },
    {
      bg: "demo23",
      name: "no sidebar",
      link: "/shop/no_sidebar",
      btnName: "Preview",
    },
    {
      bg: "demo52",
      name: "metro",
      link: "/shop/metro",
      btnName: "Preview",
    },
    {
      bg: "demo53",
      name: "full width",
      link: "/shop/full_width",
      btnName: "Preview",
    },
  ];

  const ProductData = [
    {
      bg: "demo33",
      name: "left sidebar",
      link: "/product-details/1",
      btnName: "Preview",
    },
    {
      bg: "demo36",
      name: "right sidebar",
      link: "/product-details/right_sidebar",
      btnName: "Preview",
    },
    {
      bg: "demo34",
      name: "no sidebar",
      link: "/product-details/no-sidebar",
      btnName: "Preview",
    },
    {
      bg: "demo27",
      name: "col left",
      link: "/product-details/3_col_left",
      btnName: "Preview",
    },
    {
      bg: "demo28",
      name: "col right",
      link: "/product-details/3_col_right",
      btnName: "Preview",
    },
    {
      bg: "demo33",
      name: "accordian",
      link: "/product-details/accordian",
      btnName: "Preview",
    },
    {
      bg: "demo31",
      name: "column",
      link: "/product-details/thumbnail_outside",
      btnName: "Preview",
    },
    {
      bg: "demo32",
      name: "left image",
      link: "/product-details/thumbnail_left",
      btnName: "Preview",
    },
    {
      bg: "demo28",
      name: "right image",
      link: "/product-details/thumbnail_right",
      btnName: "Preview",
    },
    {
      bg: "demo33",
      name: "vertical",
      link: "/product-details/vertical_tab",
      btnName: "Preview",
    },
  ];

  const MasterComponent = ({ ribon, bg, name, link, btnName }) => {
    return (
      <Col sm="6" className="text-center demo-effects">
        <div className="set-position">
          <div className={`layout-container ${bg}`}>
            {ribon ? (
              <div className="ribbon-1">
                <span>n</span>
                <span>e</span>
                <span>w</span>
              </div>
            ) : (
              ""
            )}
          </div>
          <div className="demo-text">
            <h4>{name}</h4>
            <div
              className="btn-group demo-btn"
              role="group"
              aria-label="Basic example">
              <Link href={link} as={link} className="btn new-tab-btn">
                {btnName}
              </Link>
            </div>
          </div>
        </div>
      </Col>
    );
  };

  return (
    null
  );
};

export default ThemeSettings;
