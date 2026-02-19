import { Outlet, useLocation, useNavigate } from "react-router";
import { Home, MapPin, Settings } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "../../backend/hooks";

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();

  const navItems = [
    { path: "/app", icon: Home, label: t.navHome },
    { path: "/app/location", icon: MapPin, label: t.navLocation },
    { path: "/app/settings", icon: Settings, label: t.navSettings },
  ];

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="border-t border-border bg-card">
        <div className={`flex items-center justify-around h-16 px-4 ${isRTL ? "flex-row-reverse" : ""}`}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center gap-1 relative px-4 py-2 transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon 
                  className={`relative z-10 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span 
                  className={`relative z-10 text-xs transition-colors ${
                    isActive ? "text-primary font-medium" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}