"use client";
import React, { useCallback, useEffect } from "react";
import DefaultIcon from "@/assets/widgetDefault.png";
import ActiveIcon from "@/assets/widgetActive.png";
import Start from "./Start";
import Message from "./Message";
import Call from "./Call";
import DataCollection from "./DataCollection";
import { useWidget, WidgetProvider } from "@/context/WidgetContext";

const Page = ({ widgetId }) => {
  const { isOpen, setIsOpen, activeComponent, setActiveComponent, contact } =
    useWidget();

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
          <Start onCardClick={(component) => setActiveComponent(component)} />
        );
    }
  }, [activeComponent, setActiveComponent]);

  return (
    <div className="relative">
      {isOpen && (
        <div className="fixed bottom-0 right-0 w-full h-full md:bottom-24 md:right-8 md:w-[432px] md:h-[643px] bg-slate-100 border border-slate-300 rounded-none md:rounded-[18px] shadow-2xl flex flex-col">
          {renderComponent()}
        </div>
      )}

      {/* Toggle Button */}
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

export default App;
