"use client"; // This marks the file as a client component

import { useState, useEffect } from "react";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState(""); // Initial default number
  const [formattedNumbers, setFormattedNumbers] = useState({});
  const [selectedFormatIndex, setSelectedFormatIndex] = useState(0); // To track which format is selected
  const [highlightedIndex, setHighlightedIndex] = useState(null); // To track the highlighted index
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

    // Automatically select and highlight the first format when new number is entered
    if (Object.keys(formatted).length > 0) {
      setSelectedFormatIndex(0);
      setHighlightedIndex(0);
    }
  };

  // Handle key press for up/down arrow navigation and copy action
  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      // Move down the list and highlight the next format
      setSelectedFormatIndex((prev) =>
        Math.min(prev + 1, Object.keys(formattedNumbers).length - 1)
      );
      setHighlightedIndex((prev) =>
        Math.min(prev + 1, Object.keys(formattedNumbers).length - 1)
      ); // Highlight the next format
    } else if (event.key === "ArrowUp") {
      // Move up the list and highlight the previous format
      setSelectedFormatIndex((prev) => Math.max(prev - 1, 0));
      setHighlightedIndex((prev) => Math.max(prev - 1, 0)); // Highlight the previous format
    } else if (event.key === "c" && (event.ctrlKey || event.metaKey)) {
      // Copy selected format if Ctrl+C or Cmd+C is pressed
      const selectedFormat =
        Object.values(formattedNumbers)[selectedFormatIndex];
      if (selectedFormat) {
        navigator.clipboard.writeText(selectedFormat).then(() => {
          setCopyMessage("Number has copied!");
          setTimeout(() => {
            setCopyMessage(""); // Clear the message after 1 second
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

  // Handle mouse click for copying and highlight the clicked format
  const handleClick = (formatted, index) => {
    navigator.clipboard.writeText(formatted).then(() => {
      setCopyMessage("Number has copied!");
      // Highlight the clicked number and unhighlight the previously selected one
      setHighlightedIndex(index);
      setTimeout(() => {
        setCopyMessage(""); // Clear the message after 1 second
      }, 1000);
    });
  };

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col items-center p-6"
      style={{ paddingLeft: "25%", paddingRight: "25%" }}
    >
      {/* Your content goes here */}
      <div className="bg-white pt-[5px] pb-[5px] pl-6 pr-6 sm:pt-[5px] sm:pb-[8px] md:pt-[5px] md:pb-[8px] lg:pt-[5px] lg:pb-[8px] xl:pt-[10px] xl:pb-[20px] rounded-[20px] shadow-lg">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6 pl-[30px] pr-[30px]">
          USA Number Formatter
        </h1>

        {/* Input field for the user to enter a phone number */}
        <div className="mb-6 pl-[30px] pr-[30px]">
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
        <div className="space-y-4 w-full pl-[30px] pr-[30px]">
          <p className="text-lg font-semibold text-gray-700 mt-1 mb-1">
            Formatted Numbers:
          </p>
          {Object.entries(formattedNumbers).map(([key, formatted], index) => (
            <div
              key={key}
              className={`p-4 rounded-md border cursor-pointer transition-all ${
                highlightedIndex === index // Highlight the clicked or selected format
                  ? "bg-blue-100 border-blue-500" // Highlight clicked format
                  : "bg-white border-gray-300"
              }`}
              onClick={() => handleClick(formatted, index)} // Handle mouse click to copy and highlight
              style={{
                outline:
                  highlightedIndex === index ? "2px solid #007BFF" : "none",
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
