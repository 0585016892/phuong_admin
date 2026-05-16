import { createContext, useContext, useEffect, useState } from "react";
import { dashboardApi } from "../api/dashboard.api";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getStats();
      setDashboard(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <AppContext.Provider value={{ dashboard, loading }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
