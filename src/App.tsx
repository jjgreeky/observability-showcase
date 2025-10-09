import React, { useState, useEffect, useRef } from 'react';
import Step from './components/Step';
import './App.css';

interface StepData {
  id: string;
  title: string;
  description: string;
  image?: string;
}

const App: React.FC = () => {
  const [steps, setSteps] = useState<StepData[]>([]);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    // Add cache-busting parameter
    const cacheBuster = new Date().getTime();
    setLoading(true);
    setError(null);
    
    fetch(`${process.env.PUBLIC_URL}/HOMEWORK_SOLUTION_SUMMARY.md?v=${cacheBuster}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load content: ${response.status}`);
        }
        return response.text();
      })
      .then((text) => {
        const parsedSteps = parseMarkdown(text);
        setSteps(parsedSteps);
        stepRefs.current = stepRefs.current.slice(0, parsedSteps.length);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading markdown:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (let i = stepRefs.current.length - 1; i >= 0; i--) {
        const ref = stepRefs.current[i];
        if (ref && ref.offsetTop <= scrollPosition) {
          setActiveStep(i);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [steps]);

  const parseMarkdown = (markdown: string): StepData[] => {
    const sections = markdown.split('---').map(s => s.trim());

    return sections.map((section, index) => {
      const lines = section.split('\n');
      const titleLine = lines.find(line => line.startsWith('##'));
      const title = titleLine ? titleLine.replace('## ', '') : `Step ${index + 1}`;
      const id = `step-${index}`;

      return {
        id,
        title,
        description: section,
      };
    });
  };

  const scrollToStep = (index: number) => {
    stepRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    setActiveStep(index);
    setMenuOpen(false);
  };

  return (
    <div className="container-fluid">
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">Skip to main content</a>
      
      {/* Mobile Header Bar */}
      <header className="mobile-header d-md-none" role="banner">
        <h1 className="mobile-header-title">Observability Stack Guide</h1>
      </header>

      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-btn d-md-none"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        aria-controls="navigation-menu"
      >
        <span className={`hamburger ${menuOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="mobile-overlay d-md-none"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="row">
        <nav 
          className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}
          id="navigation-menu"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="sidebar-sticky">
            <a
              href="#introduction"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setMenuOpen(false);
                setActiveStep(0);
              }}
              className={`nav-link ${activeStep === 0 ? 'active' : ''}`}
              aria-current={activeStep === 0 ? 'page' : undefined}
            >
              Introduction
            </a>
            {steps.map((step, index) => (
              <a
                key={index}
                href={`#${step.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToStep(index);
                }}
                className={`nav-link ${activeStep === index ? 'active' : ''}`}
                aria-current={activeStep === index ? 'page' : undefined}
              >
                {step.title.split(':')[0]}
              </a>
            ))}
          </div>
        </nav>
        <main className="main-content" id="main-content" role="main">
          <section ref={el => { stepRefs.current[0] = el; }} id="introduction">
            <h1>Observability Stack Implementation</h1>
            <p className="lead">A comprehensive guide to deploying a production-grade observability stack on Google Kubernetes Engine, integrating metrics, logs, and traces with Grafana Cloud.</p>

            <div className="mb-4">
              <a
                href="https://jonathantschetterjr.grafana.net/public-dashboards/c5368a906f9547ddb6b2c9e073225de2"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-lg"
                aria-describedby="dashboard-description"
              >
                📊 View Live Grafana Dashboard
              </a>
              <p id="dashboard-description" className="text-muted small">
                Explore the live dashboard showing metrics, logs, and traces from the deployed observability stack.
              </p>
              <div className="alert alert-info mt-2" role="note">
                <strong>Note:</strong> You'll need to toggle the app on/off to generate metrics, logs, and traces due to cost considerations. The dashboard will show data when traffic is actively being generated.
              </div>
            </div>
          </section>
          
          {loading && (
            <div className="text-center py-5" role="status" aria-live="polite">
              <div className="spinner-border text-primary" aria-hidden="true"></div>
              <p className="mt-3">Loading content...</p>
            </div>
          )}
          
          {error && (
            <div className="alert alert-danger" role="alert" aria-live="assertive">
              <h4 className="alert-heading">Error Loading Content</h4>
              <p>{error}</p>
              <hr />
              <p className="mb-0">Please refresh the page to try again.</p>
            </div>
          )}
          
          {!loading && !error && steps.map((step, index) => (
            <section key={index} ref={el => { stepRefs.current[index] = el; }} id={step.id}>
              <Step
                title={step.title}
                description={step.description}
              />
            </section>
          ))}
        </main>
      </div>
    </div>
  );
};

export default App;
