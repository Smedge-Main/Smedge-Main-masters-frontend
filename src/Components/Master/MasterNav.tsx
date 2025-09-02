import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./MasterNavbar.css";

const MasterNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePath, setActivePath] = useState(location.pathname);

  // update activePath whenever route changes
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  const menuItems = [
    { label: "Analytics", path: "#" },
    { label: "Course Settings", path: "#" },
    { label: "Masters", path: "/master-pipeline" }, // canonical path
  ];

  const handleClick = (item: { label: string; path: string }) => {
    if (item.path !== "#") {
      navigate(item.path);
    }
  };

  return (
    <div className="master-navbar p-3">
      <div
        className="mb-3 cursor-pointer text-muted"
        onClick={() => navigate("/dashboard")}
      >
        ← Dashboard
      </div>
      <h5 className="fw-bold mb-4">Settings</h5>

      <ul className="list-unstyled">
        {menuItems.map((item) => {
          let isActive = false;

          if (item.label === "Masters") {
            // Masters should be active on both /master-pipeline and /pipeline/*
            isActive =
              activePath.startsWith("/master-pipeline") ||
              activePath.startsWith("/pipeline");
          } else {
            isActive = activePath.startsWith(item.path) && item.path !== "#";
          }

          console.log(item.label, activePath, isActive);

          return (
            <li
              key={item.label}
              className={`sidebar-link py-2 px-3 ${isActive ? "active" : ""} ${
                item.path === "#" ? "disabled-link" : "clickable-link"
              }`}
              onClick={() => handleClick(item)}
            >
              {item.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MasterNavbar;
