/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import mondaySdk from "monday-sdk-js";
import _, { isMatch } from "lodash";

const monday = mondaySdk();

export function useAppSettings(): {
  data?: Record<string, any>;
  isLoading: boolean;
} {
  const [currentSettings, setCurrentSettings] = useState({ isLoading: true });

  const handleSettingsChange = (settingsEvent) => {
    setCurrentSettings((previousSettings) =>
      isMatch(previousSettings, settingsEvent)
        ? previousSettings
        : { isLoading: false, ...settingsEvent }
    );
  };

  const debouncedHandleSettingsChange = _.debounce(handleSettingsChange, 500);

  useEffect(() => {
    const unsubscribe = monday.listen(
      "settings",
      debouncedHandleSettingsChange
    );
    return () => {
      unsubscribe();
    };
  }, []);

  return currentSettings;
}
