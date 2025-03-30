"use client";
import { useCallback, useEffect, useState } from "react";
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
    const topMargin = isMobile ? 40 : 50; // Increased top margin to ensure clear visibility
    const bottomSpace = 96; // 6rem (increased from 84px)

    // Calculate available height after accounting for margins
    const availableHeight =
      viewportHeight - topMargin - (isMobile ? buttonSize : bottomSpace);

    // Hide "Powered by Intervo" text if available height is limited
    // More aggressive condition to ensure it hides when space is tight
    const isHeightConstrained = availableHeight < 600; // Increased from 560 to catch more constrained cases
    setShouldHidePoweredBy(isHeightConstrained);

    if (isMobile) {
      // On mobile, ensure there's sufficient margin at top and bottom
      const newHeight = viewportHeight - topMargin - buttonSize;
      setWidgetHeight(`${newHeight}px`);
      setWidgetPosition({
        top: `${topMargin}px`,
        bottom: "auto",
        maxHeight: `${newHeight}px`, // Ensure content doesn't exceed this height
      });
    } else {
      // On desktop, maintain default height unless viewport is too small
      const defaultHeight = 643;

      if (viewportHeight < defaultHeight + topMargin + bottomSpace) {
        // Increased bottom margin
        const newHeight = viewportHeight - topMargin - bottomSpace;
        setWidgetHeight(`${newHeight}px`);
        // Position from top with sufficient margin
        setWidgetPosition({
          top: `${topMargin}px`,
          bottom: "auto",
          maxHeight: `${newHeight}px`, // Ensure content doesn't exceed this height
        });
      } else {
        setWidgetHeight("643px"); // Default height for desktop
        // Default positioning from bottom
        setWidgetPosition({
          top: "auto",
          bottom: `${bottomSpace}px`, // Increased space for button (6rem)
        });
      }
    }

    // Log the state for debugging
    console.log(
      "Height constrained:",
      isHeightConstrained,
      "Available height:",
      availableHeight
    );
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
    console.log(
      "rerendering renderComponent",
      activeComponent,
      "hidePoweredBy:",
      shouldHidePoweredBy
    );
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

  return (
    <div className="relative">
      {isOpen && (
        <div
          className="fixed w-full md:w-[432px] bg-slate-100 border border-slate-300 rounded-none md:rounded-[18px] shadow-2xl flex flex-col z-40 overflow-hidden"
          style={{
            height: widgetHeight,
            right: window.innerWidth < 768 ? "0" : "32px", // Increased to 2rem (32px)
            ...widgetPosition,
          }}
        >
          <div className="flex flex-col h-full overflow-auto">
            {renderComponent()}
          </div>
        </div>
      )}

      {/* Toggle Button - higher z-index to always be clickable */}
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
