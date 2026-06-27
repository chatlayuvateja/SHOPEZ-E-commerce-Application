import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const RouterContext = createContext(null);

export function useNavigate() {
  const ctx = useContext(RouterContext);
  return ctx.navigate;
}

export function useParams() {
  const ctx = useContext(RouterContext);
  return ctx.params || {};
}

export function useLocation() {
  const ctx = useContext(RouterContext);
  return ctx.location;
}

export function useSearchParams() {
  const ctx = useContext(RouterContext);
  return [new URLSearchParams(ctx.location.search), (params) => {
    const qs = typeof params === 'string' ? params : params.toString();
    ctx.navigate(ctx.location.pathname + (qs ? '?' + qs : ''), true);
  }];
}

function matchPath(pattern, pathname) {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) return null;

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

export function Routes({ children }) {
  const ctx = useContext(RouterContext);
  const pathname = ctx.location.pathname;

  let matched = null;
  let matchedParams = {};
  React.Children.forEach(children, (child) => {
    if (matched) return;
    if (child && child.type === Route) {
      const params = matchPath(child.props.path, pathname);
      if (params !== null) {
        matched = child;
        matchedParams = params;
      }
    }
  });

  // Use effect to update params — never call setState during render!
  useEffect(() => {
    ctx.setParams(matchedParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, ctx, JSON.stringify(matchedParams)]);

  if (matched) {
    return React.cloneElement(matched, { key: pathname });
  }

  // Find a default/fallback route
  React.Children.forEach(children, (child) => {
    if (matched) return;
    if (child && child.type === Route && child.props.path === '*') {
      matched = child;
    }
  });

  return matched || null;
}

export function Route({ element }) {
  return element || null;
}

export function Link({ to, children, className, style, onClick, ...props }) {
  const ctx = useContext(RouterContext);
  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) onClick(e);
    ctx.navigate(to);
  };
  return React.createElement('a', {
    href: to,
    className,
    style,
    onClick: handleClick,
    ...props
  }, children);
}

export function Navigate({ to }) {
  const ctx = useContext(RouterContext);
  useEffect(() => { ctx.navigate(to, true); }, [ctx, to]);
  return null;
}

export function BrowserRouter({ children }) {
  const [location, setLocation] = useState(() => ({
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  }));
  const [params, setParams] = useState({});

  const navigate = useCallback((to, replace = false) => {
    if (replace) {
      window.history.replaceState(null, '', to);
    } else {
      window.history.pushState(null, '', to);
    }
    setLocation({
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setLocation({
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      });
      setParams({});
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return React.createElement(RouterContext.Provider, {
    value: { location, navigate, params, setParams }
  }, children);
}
