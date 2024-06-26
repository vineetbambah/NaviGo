"use client";
import React, { useState, useEffect } from "react";
import { HoverBorderGradient } from "./hover-border-gradient";
import { PlaceholderInput } from "./PlaceholderInput";
import { ChatDrawer } from "./ChatDrawer";

export function BoxComponent() {
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { query: string; response: string }[]
  >([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false); // Track API call state

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isDrawerOpen]);

  const placeholders = [
    "Which airlines have the best accessibility options?",
    "How can I find gender-neutral restrooms near me?",
    "Are there any LGBTQ+ friendly hotels in New York?",
    "What are the best cities for gender non-conforming travelers?",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClick = (text: string) => {
    setQuery(text);
    setIsDrawerOpen(true); // Open the drawer when a button is clicked
  };

  const OnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isFetching) return; // Prevent duplicate submissions

    const apiKey = "t9oNS5jhZldojcnJKBpxTU7nnpsY1S7g"; // Replace with your actual API key
    const externalUserId = "poikpak"; // Replace with your actual external user ID

    try {
      setIsFetching(true); // Set fetching state to true

      // Step 1: Create Chat Session
      const createSessionResponse = await fetch(
        "https://gateway-dev.on-demand.io/chat/v1/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: apiKey,
          },
          body: JSON.stringify({
            pluginIds: [],
            externalUserId: externalUserId,
          }),
        }
      );
      const createSessionData = await createSessionResponse.json();
      const sessionId = createSessionData.chatSession.id;

      if (sessionId) {
        // Step 2: Answer Query using the sessionId from Step 1
        const queryResponse = await fetch(
          `https://gateway-dev.on-demand.io/chat/v1/sessions/${sessionId}/query`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: apiKey,
            },
            body: JSON.stringify({
              endpointId: "predefined-openai-gpt3.5turbo",
              query: query,
              pluginIds: [
                "plugin-1717340460",
                "plugin-1717437831",
                "plugin-1713924030",
                "plugin-1715072649",
              ],
              responseMode: "sync",
            }),
          }
        );

        const queryData = await queryResponse.json();
        const responseText = queryData.chatMessage?.answer || "No response";

        // Update chat history
        setChatHistory((prevHistory) => [
          ...prevHistory,
          { query, response: responseText },
        ]);
        setIsDrawerOpen(true); // Open the drawer when a query is submitted
      } else {
        console.error("Failed to create chat session");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    } finally {
      setIsFetching(false); // Reset fetching state
    }
  };

  return (
    <div>
      <div className="flex flex-col justify-center text-center space-y-8 mt-20 px-2">
        <HoverBorderGradient
          containerClassName="rounded-lg w-[450px]"
          as="button"
          className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 w-[450px]"
          onClick={() => handleClick("What's the weather in like Dubai")}
        >
          <span>What&apos;s the weather in like Dubai</span>
        </HoverBorderGradient>
        <HoverBorderGradient
          containerClassName="rounded-lg w-[450px]"
          as="button"
          className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 w-[450px]"
          onClick={() => handleClick("Give me list of hotels in New York")}
        >
          <span>Give me list of hotels in New York</span>
        </HoverBorderGradient>
        <HoverBorderGradient
          containerClassName="rounded-lg w-[450px]"
          as="button"
          className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 w-[450px]"
          onClick={() => handleClick("List some unisex accessible bathrooms")}
        >
          <span>List some unisex accessible bathrooms</span>
        </HoverBorderGradient>
      </div>
      <div>
        <div className="flex flex-row justify-center items-center mt-20 w-[600px]">
          <PlaceholderInput
            placeholders={placeholders}
            value={query}
            onChange={handleChange}
            onSubmit={OnSubmit}
          />
        </div>
      </div>
      <ChatDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        chatHistory={chatHistory}
        query={query}
        onChange={handleChange}
        onSubmit={OnSubmit}
      />
    </div>
  );
}
