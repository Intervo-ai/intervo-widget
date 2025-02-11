"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
  useEffect,
} from "react";
import returnAPIUrl from "@/config/config";
import { transformAgentData } from "@/lib/utils";

const backendAPIUrl = returnAPIUrl();

const initialState = {
  contact: {
    fullName: "",
    email: "",
    phone: "",
    collected: false,
  },
  widgetConfig: {},
  messages: [],
  isLoading: false,
  error: null,
  widgetConnection: {
    scriptId: null,
    verificationKey: null,
    iframeUrl: null,
  },
  isOpen: false,
  activeComponent: "main",
  isConnected: false,
  conversationState: null,
  aiConfig: {},
  socket: null,
  callState: "idle", // idle, ringing, connected
  device: null,
};

function widgetReducer(state, action) {
  switch (action.type) {
    case "SET_CONTACT":
      return {
        ...state,
        contact: {
          ...state.contact,
          ...action.payload,
          collected: true,
        },
      };

    case "SET_WIDGET_CONFIG":
      return {
        ...state,
        widgetConfig: action.payload,
      };
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    case "CLEAR_MESSAGES":
      return {
        ...state,
        messages: [],
      };
    case "SET_WIDGET_CONNECTION":
      return {
        ...state,
        widgetConnection: action.payload,
      };
    case "SET_IS_OPEN":
      return {
        ...state,
        isOpen: action.payload,
      };
    case "SET_ACTIVE_COMPONENT":
      return {
        ...state,
        activeComponent: action.payload,
      };
    case "SET_CONNECTED":
      return {
        ...state,
        isConnected: action.payload,
      };
    case "SET_CONVERSATION_STATE":
      return {
        ...state,
        conversationState: action.payload,
      };
    case "SET_AI_CONFIG":
      return {
        ...state,
        aiConfig: action.payload,
      };
    case "SET_SOCKET":
      return {
        ...state,
        socket: action.payload,
      };
    case "SET_CALL_STATE":
      return { ...state, callState: action.payload };
    case "SET_DEVICE":
      return { ...state, device: action.payload };
    case "GET_CURRENT_STATE":
      return state;
    default:
      return state;
  }
}

const WidgetContext = createContext();

export function WidgetProvider({ children, widgetId }) {
  console.log(widgetId, "widgetId");
  const [state, dispatch] = useReducer(widgetReducer, {
    ...initialState,
    widgetId: widgetId,
  });
  const socketRef = useRef(null);
  const stateRef = useRef(state);

  // Keep stateRef updated with latest state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const setIsOpen = (isOpen) => {
    dispatch({ type: "SET_IS_OPEN", payload: isOpen });
  };

  const getWsToken = async () => {
    try {
      const response = await fetch(
        `${backendAPIUrl}/auth/ws-token?widgetId=${state.widgetId}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Failed to get WS token:", error);
      return null;
    }
  };

  const setActiveComponent = (component) => {
    dispatch({ type: "SET_ACTIVE_COMPONENT", payload: component });
  };

  const createContact = async (contactData) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // Extract country code and phone number from the phone input
      const phoneNumber = contactData.phone; // Keep the full phone number with country code

      const response = await fetch(
        `${backendAPIUrl}/workflow/widget/${state.widgetId}/contact`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: contactData.fullName,
            email: contactData.email,
            phoneNumber: phoneNumber, // Full phone number including country code
            countryCode: contactData.countryCode,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const data = await response.json();
      dispatch({ type: "SET_CONTACT", payload: data });
      return data;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const addMessage = (message) => {
    dispatch({ type: "ADD_MESSAGE", payload: message });
  };

  const clearMessages = () => {
    dispatch({ type: "CLEAR_MESSAGES" });
  };

  const setWidgetConfig = (config) => {
    dispatch({ type: "SET_WIDGET_CONFIG", payload: config });
  };

  const getWidgetConnection = async (agentId) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await fetch(
        `${backendAPIUrl}/agents/${agentId}/widget-connection`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const data = await response.json();
      dispatch({
        type: "SET_WIDGET_CONNECTION",
        payload: {
          scriptId: data.scriptId,
          verificationKey: data.verificationKey,
          iframeUrl: data.iframeUrl,
        },
      });
      return data;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const generateVerificationHash = (userId, verificationKey) => {
    // This is just an example - actual implementation should be on the server side
    return {
      example: `const crypto = require('crypto');
const secret = '${verificationKey}'; // Your verification secret key
const userId = current_user.id // A string UUID to identify your user
const hash = crypto.createHmac('sha256', secret).update(userId).digest('hex');`,
    };
  };

  const getEmbedScript = (scriptId) => {
    return {
      script: `<script>
(function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="${scriptId}";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();
</script>`,
    };
  };

  const getIframeEmbed = (iframeUrl) => {
    return {
      iframe: `<iframe
    src="${iframeUrl}"
    width="100%"
    style="height: 100%; min-height: 700px"
    frameborder="0"
></iframe>`,
    };
  };

  const setupWebSocket = useCallback(async (token, agentId, type, aiConfig) => {
    // Check the ref instead of state
    if (socketRef.current) {
      return socketRef.current;
    }

    console.log("setting up websocket");
    try {
      const wsUrl = `${backendAPIUrl.replace(
        "http",
        "ws"
      )}/stream?token=${token}&type=client`;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket; // Set the ref immediately

      socket.onopen = () => {
        // Use stateRef.current to access latest state
        const startMessage = {
          event: "start",
          start: {
            customParameters: {
              "agent-id": agentId,
              contactId: stateRef.current.contact._id,
              mode: type,
              widgetId: stateRef.current.widgetId,
              ...(aiConfig || {}),
            },
          },
        };
        socket.send(JSON.stringify(startMessage));

        // Then dispatch the connected state
        dispatch({ type: "SET_CONNECTED", payload: true });
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.event === "transcription") {
          dispatch({
            type: "ADD_MESSAGE",
            payload: {
              text: data.text,
              source: data.source,
            },
          });
        } else if (data.event === "conversationState") {
          dispatch({
            type: "SET_CONVERSATION_STATE",
            payload: data.state,
          });
        }
      };

      socket.onclose = () => {
        console.log("Disconnected from WebSocket server");
        socketRef.current = null; // Clear the ref
        dispatch({ type: "SET_CONNECTED", payload: false });
        dispatch({ type: "SET_SOCKET", payload: null });
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        dispatch({ type: "SET_ERROR", payload: "WebSocket connection error" });
      };

      dispatch({ type: "SET_SOCKET", payload: socket });
      return socket;
    } catch (error) {
      console.error("Error setting up WebSocket:", error);
      throw error;
    }
  }, []); // Keep empty dependency array

  const cleanupWebSocket = () => {
    if (state.socket) {
      state.socket.close();
      dispatch({ type: "SET_SOCKET", payload: null });
      dispatch({ type: "SET_CONNECTED", payload: false });
    }
  };

  const initializeChat = async (agentId) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // 1. Get WebSocket token
      const wsToken = await getWsToken();
      if (!wsToken) {
        throw new Error("Failed to get WebSocket token");
      }

      // 2. Prepare the conversation
      const response = await fetch(`${backendAPIUrl}/stream/prepare`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aiConfig: JSON.stringify({
            agentId,
            widgetId: state.widgetId,
            source: "widget",
          }),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to prepare conversation");
      }

      const prepareData = await response.json();
      const updatedAiConfig = {
        ...state.aiConfig,
        agentId: agentId,
        source: "widget",
        widgetId: state.widgetId,
        contactId: state.contact._id,
        conversationId: prepareData.conversationId,
      };

      dispatch({ type: "SET_AI_CONFIG", payload: updatedAiConfig });

      console.log("setting up websocket0");
      // 3. Initialize WebSocket
      await setupWebSocket(wsToken, agentId, "chat", updatedAiConfig);

      return true;
    } catch (error) {
      console.error("Error initializing chat:", error);
      dispatch({ type: "SET_ERROR", payload: error.message });
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const cleanupChat = () => {
    cleanupWebSocket();
    dispatch({ type: "CLEAR_MESSAGES" });
    dispatch({ type: "SET_AI_CONFIG", payload: {} });
    dispatch({ type: "SET_CONVERSATION_STATE", payload: null });
  };

  const sendMessage = async (message) => {
    if (!message.trim() || !state.isConnected || !state.socket) return false;

    try {
      // Add user message to UI immediately
      dispatch({
        type: "ADD_MESSAGE",
        payload: { text: message, source: "user" },
      });

      // Send message through WebSocket
      state.socket.send(
        JSON.stringify({
          event: "chat_message",
          message: { text: message },
        })
      );

      return true;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      return false;
    }
  };

  const initiateCall = async (agentId) => {
    dispatch({ type: "SET_CALL_STATE", payload: "ringing" });
    try {
      // 1. Get WebSocket token
      const wsToken = await getWsToken();
      if (!wsToken) {
        throw new Error("Failed to get WebSocket token");
      }

      // 2. Prepare the call
      const response = await fetch(`${backendAPIUrl}/stream/prepare`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aiConfig: JSON.stringify({
            agentId,
            widgetId: state.widgetId,
            source: "widget",
          }),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to prepare call");
      }

      const prepareData = await response.json();
      const updatedAiConfig = {
        ...state.aiConfig,
        conversationId: prepareData.conversationId,
        agentId: agentId,
        widgetId: state.widgetId,
        contactId: state.contact._id,
        source: "widget",
      };

      // 3. Initialize WebSocket
      await setupWebSocket(wsToken, agentId);

      console.log(state.device, "devic status");
      // 4. Start the call using Twilio device with audio constraints
      if (!state.device) throw new Error("Twilio device not ready");

      const connection = state.device.connect({
        To: "client",
        aiConfig: JSON.stringify(updatedAiConfig),
        // Add audio constraints to prevent echo
        rtcConstraints: {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        },
      });

      if (!connection) {
        throw new Error("Failed to make a call. Device not ready.");
      }

      dispatch({ type: "SET_CALL_STATE", payload: "connected" });
      return true;
    } catch (error) {
      console.error("Error initiating call:", error);
      dispatch({ type: "SET_ERROR", payload: error.message });
      dispatch({ type: "SET_CALL_STATE", payload: "idle" });
      return false;
    }
  };

  const endCall = () => {
    if (state.device) {
      state.device.disconnectAll();
      cleanupWebSocket();
      dispatch({ type: "SET_CALL_STATE", payload: "idle" });
    }
  };

  const setDevice = (device) => {
    dispatch({ type: "SET_DEVICE", payload: device });
  };

  return (
    <WidgetContext.Provider
      value={{
        ...state,
        createContact,
        addMessage,
        clearMessages,
        setWidgetConfig,
        getWidgetConnection,
        generateVerificationHash,
        getEmbedScript,
        getIframeEmbed,
        setIsOpen,
        setActiveComponent,
        setupWebSocket,
        cleanupWebSocket,
        initializeChat,
        cleanupChat,
        sendMessage,
        initiateCall,
        endCall,
        setDevice,
      }}
    >
      {children}
    </WidgetContext.Provider>
  );
}

export function useWidget() {
  return useContext(WidgetContext);
}
