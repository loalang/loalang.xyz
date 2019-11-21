import React, { ReactElement } from "react";
import { Router } from "@reach/router";
import { TopNavigationContext } from "./TopNavigation";
import { Icon } from "./Icons/Icon";
import Header from "./Header";

export interface TopRouteProps {
  name: string;
  path: string;
  icon: Icon;
}

export interface TopRouterProps {
  children: ReactElement<TopRouteProps>[] | ReactElement<TopRouteProps>;
}

export default function TopRouter({ children }: TopRouterProps) {
  return (
    <Router>
      <TopRouterBody path="/*" elements={children} />
    </Router>
  );
}

function TopRouterBody({
  elements
}: {
  elements: ReactElement<TopRouteProps>[] | ReactElement<TopRouteProps>;
}) {
  return (
    <div>
      <TopNavigationContext.Provider
        value={{
          menuItems: React.Children.map(elements, child => child.props)
        }}
      >
        <Header />
        <Router>{elements}</Router>
      </TopNavigationContext.Provider>
    </div>
  );
}
