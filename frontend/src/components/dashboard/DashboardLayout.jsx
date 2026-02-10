import React from "react";

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout" style={{ display: "flex", height: "100vh" }}>
      <aside style={{ width: "300px", padding: "1rem", borderRight: "1px solid #ddd", overflowY: "auto" }}>
        {children.filters}
      </aside>
      <main style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
        {children.content}
      </main>
    </div>
  );
};

export default DashboardLayout;
