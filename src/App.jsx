"use client";
import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import DefaultIcon from "@/assets/widgetDefault.png";
import ActiveIcon from "@/assets/widgetActive.png";
import Start from "./Start";
import Message from "./Message";
import Call from "./Call";
import DataCollection from "./DataCollection";
import { useWidget, WidgetProvider } from "@/context/WidgetContext";

const Page = () => {
  const { isOpen, setIsOpen, activeComponent, setActiveComponent, contact } =
    useWidget();
  const [widgetHeight, setWidgetHeight] = useState("643px");
  const [widgetPosition, setWidgetPosition] = useState({});
  const [shouldHidePoweredBy, setShouldHidePoweredBy] = useState(false);

  // Function to update widget dimensions based on viewport
  const updateWidgetDimensions = useCallback(() => {
    const viewportHeight = window.innerHeight;
    const isMobile = window.innerWidth < 768;
    const buttonSize = 62; // 50px icon + margin

    // Check if height is constrained enough to hide "Powered by" text
    const isHeightConstrained = viewportHeight < 560;
    setShouldHidePoweredBy(isHeightConstrained);

    if (isMobile) {
      // On mobile, use full height with a small margin at the top
      const topMargin = 20; // 20px margin from the top
      const newHeight = viewportHeight - topMargin - buttonSize;
      setWidgetHeight(`${newHeight}px`);
      setWidgetPosition({ top: `${topMargin}px`, bottom: "auto" });
    } else {
      // On desktop, use default height unless viewport is too small
      const defaultHeight = 643;
      const minMarginTop = 30; // Minimum margin from the top

      if (viewportHeight < defaultHeight + minMarginTop + 24) {
        // 24px for bottom margin
        const newHeight = viewportHeight - minMarginTop - 24;
        setWidgetHeight(`${newHeight}px`);
      } else {
        setWidgetHeight("643px"); // Default height for desktop
      }
      setWidgetPosition({}); // Reset position for desktop (will use default bottom-24)
    }
  }, []);

  // Update dimensions on mount and when window resizes
  useEffect(() => {
    updateWidgetDimensions();
    window.addEventListener("resize", updateWidgetDimensions);

    return () => {
      window.removeEventListener("resize", updateWidgetDimensions);
    };
  }, [updateWidgetDimensions]);

  useEffect(() => {
    console.log("mounting widget");
    return () => {
      console.log("Unmounting widget");
    };
  }, []);

  const renderComponent = useCallback(() => {
    console.log("rerendering renderComponent", activeComponent);
    if (activeComponent !== "main" && !contact.collected) {
      return (
        <DataCollection
          initialData={contact}
          activeComponent={activeComponent}
          onBack={() => setActiveComponent("main")}
        />
      );
    }

    switch (activeComponent) {
      case "message":
        return <Message onBack={() => setActiveComponent("main")} />;
      case "call":
        return <Call onBack={() => setActiveComponent("main")} />;
      case "main":
      default:
        return (
          <Start
            onCardClick={(component) => setActiveComponent(component)}
            hidePoweredBy={shouldHidePoweredBy}
          />
        );
    }
  }, [activeComponent, setActiveComponent, contact, shouldHidePoweredBy]);

  const widgetStyle = {
    height: widgetHeight,
    ...widgetPosition,
  };

  // Make sure the button isn't covered by the widget
  // The widget should be positioned to leave space for the button
  return (
    <div className="relative">
      {isOpen && (
        <div
          className="fixed w-full md:w-[432px] bg-slate-100 border border-slate-300 rounded-none md:rounded-[18px] shadow-2xl flex flex-col z-40"
          style={{
            ...widgetStyle,
            right: window.innerWidth < 768 ? "0" : "8px",
            bottom: window.innerWidth < 768 ? "70px" : "84px", // Leave space for the button
          }}
        >
          {renderComponent()}
        </div>
      )}

      {/* Toggle Button - now has higher z-index to always be clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg transition-all bg-transparent border-none p-0 focus:outline-none focus:ring-0"
      >
        {isOpen ? (
          <img src={ActiveIcon} alt="Active Icon" width={50} height={50} />
        ) : (
          <img src={DefaultIcon} alt="Default Icon" width={50} height={50} />
        )}
      </button>
    </div>
  );
};

const App = ({ widgetId }) => {
  return (
    <WidgetProvider widgetId={widgetId}>
      <Page />
    </WidgetProvider>
  );
};

App.propTypes = {
  widgetId: PropTypes.string.isRequired,
};

export default App;
