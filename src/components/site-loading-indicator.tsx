export function SiteLoadingIndicatorDisplay() {
    return <span>
      <span className="site-loading-indicator">
        <span className="site-loading-indicator-inner">
          <span className="site-loading-indicator-inner-glow" />
        </span>
      </span>
    </span>;
  }
  
  export function SiteLoadingIndicator() {
    return <div className="show-site-loading-indicator" />;
  }