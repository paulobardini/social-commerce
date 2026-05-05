import { ReactNode } from "react";
import { MarketingDataProvider, useMarketing } from "./MarketingDataContext";
import { MarketingNotificationsProvider } from "./MarketingNotificationsContext";

function NotifBridge({ children }: { children: ReactNode }) {
  const { leadsQuentes } = useMarketing();
  return (
    <MarketingNotificationsProvider leadsQuentes={leadsQuentes.map(l => ({ id: l.id, clienteNome: l.clienteNome }))}>
      {children}
    </MarketingNotificationsProvider>
  );
}

export function MarketingProviders({ children }: { children: ReactNode }) {
  return (
    <MarketingDataProvider>
      <NotifBridge>{children}</NotifBridge>
    </MarketingDataProvider>
  );
}
