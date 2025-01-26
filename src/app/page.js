"use client"; // This marks the file as a client component

import { useState, useEffect } from "react";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState("+15852826396"); // Initial default number
  const [formattedNumbers, setFormattedNumbers] = useState({});
  const [selectedFormatIndex, setSelectedFormatIndex] = useState(0); // To track which format is selected
  const [copyMessage, setCopyMessage] = useState(""); // Message for copy confirmation

  // Formats phone number into multiple formats
  const formatAllWays = (phoneNumber) => {
    const parsedNumber = parsePhoneNumberFromString(phoneNumber, "US");

    if (parsedNumber && parsedNumber.isValid()) {
      const national = parsedNumber.formatNational().replace(/\D/g, ""); // Remove non-digit characters
      const formattedWithDots = national.replace(
        /(\d{3})(\d{3})(\d{4})/,
        "$1.$2.$3"
      ); // Add dots between number groups

      return {
        international: parsedNumber.formatInternational(),
        national: parsedNumber.formatNational(),
        e164: parsedNumber.format("E.164"),
        internationalWithDots: formattedWithDots, // The formatted number with dots
      };
    }
    return {}; // Return empty if the number is invalid
  };

  // Update formatted numbers when user inputs a new phone number
  const handleInputChange = (event) => {
    const inputNumber = event.target.value;
    setPhoneNumber(inputNumber);
    const formatted = formatAllWays(inputNumber);
    setFormattedNumbers(formatted);
  };

  // Handle key press for up/down arrow navigation and copy action
  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      // Move down the list
      setSelectedFormatIndex((prev) =>
        Math.min(prev + 1, Object.keys(formattedNumbers).length - 1)
      );
    } else if (event.key === "ArrowUp") {
      // Move up the list
      setSelectedFormatIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "c" && (event.ctrlKey || event.metaKey)) {
      // Copy selected format if Ctrl+C or Cmd+C is pressed
      const selectedFormat =
        Object.values(formattedNumbers)[selectedFormatIndex];
      if (selectedFormat) {
        navigator.clipboard.writeText(selectedFormat).then(() => {
          setCopyMessage("Number has copied!");

          // Clear the message after 1 second
          setTimeout(() => {
            setCopyMessage("");
          }, 1000);
        });
      }
    }
  };

  // Add event listener for key down (only on client-side)
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [formattedNumbers, selectedFormatIndex]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <div className="w-[40%] bg-white p-6 rounded-md shadow-lg">
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-6">
          USA Number Formatter
        </h1>

        {/* Input field for the user to enter a phone number */}
        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Enter Phone Number:
          </label>
          <input
            type="text"
            value={phoneNumber}
            onChange={handleInputChange}
            placeholder="Enter phone number"
            className="p-3 w-full border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Display formatted numbers */}
        <div className="space-y-4 w-full">
          <p className="text-lg font-semibold text-gray-700">
            Formatted Numbers:
          </p>
          {Object.entries(formattedNumbers).map(([key, formatted], index) => (
            <div
              key={key}
              className={`p-4 rounded-md border cursor-pointer transition-all ${
                selectedFormatIndex === index
                  ? "bg-blue-100 border-blue-500"
                  : "bg-white border-gray-300"
              }`}
              onClick={() => {
                navigator.clipboard.writeText(formatted).then(() => {
                  setCopyMessage("Number has copied!");
                  setTimeout(() => {
                    setCopyMessage(""); // Clear the message after 1 second
                  }, 1000);
                });
              }}
              style={{
                outline:
                  selectedFormatIndex === index ? "2px solid #007BFF" : "none",
              }}
            >
              <span className="text-gray-600 ml-2">{formatted}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Copy Message as Popup at the Top */}
      {copyMessage && (
        <div
          className="fixed top-0 left-1/2 transform -translate-x-1/2 bg-green-600 text-white py-2 px-6 rounded-md shadow-md transition-all opacity-100 z-50"
          style={{ animation: "fadeInOut 1s forwards" }}
        >
          {copyMessage}
        </div>
      )}
    </div>
  );
}
