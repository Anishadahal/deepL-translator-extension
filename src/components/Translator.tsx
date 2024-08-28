import React, { useState, useEffect } from "react";

const LanguageSwitcher: React.FC = () => {
  const [from, setFrom] = useState<string>("English");
  const [to, setTo] = useState<string>("Japanese");

  useEffect(() => {
    const fetchLanguages = async () => {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.get(["from", "to"], (result) => {
          const { from: storedFrom, to: storedTo } = result as {
            from: string;
            to: string;
          };
          setFrom(storedFrom || "English");
          setTo(storedTo || "Japanese");
          console.log("Fetched from storage:", storedFrom, storedTo);
        });
      } else {
        console.log("Chrome storage is not available");
      }
    };

    fetchLanguages();
  }, []);

  const handleSwitch = () => {
    console.log("Switching languages: ", from, to);

    const temp = from;
    setFrom(to);
    setTo(temp);

    // Update chrome storage
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.set({ from: to, to: from }, () => {
        console.log("Languages updated in storage:", to, from);
      });
    } else {
      console.log("Chrome storage is not available");
    }
  };

  return (
    <div>
      <div id="from">{from}</div>
      <div id="to">{to}</div>
      <button onClick={handleSwitch}>Switch</button>
    </div>
  );
};

export default LanguageSwitcher;
