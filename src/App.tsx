import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Navbar, Nav, Offcanvas, Card } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './App.css';

interface Heading {
  id: string;
  level: number;
  title: string;
  order: number;
}

const App: React.FC = () => {
  const [sections, setSections] = useState<string[]>([]);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [activeLink, setActiveLink] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const cacheBuster = new Date().getTime();
    const controller = new AbortController();

    fetch(
      `${process.env.PUBLIC_URL}/HOMEWORK_SOLUTION_SUMMARY.md?v=${cacheBuster}`,
      { signal: controller.signal }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load content: ${response.status}`);
        }
        return response.text();
      })
      .then((text) => {
        const sectionsArray = text
          .split('---')
          .map((section) => section.trim())
          .filter(Boolean);

        setHeadings([]);
        setSections(sectionsArray);
        setLoadError(null);
      })
      .catch((error: Error) => {
        if (error.name !== 'AbortError') {
          console.error(error);
          setLoadError(
            'We were unable to load the showcase content. Please refresh or try again later.'
          );
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  const handleCloseMenu = () => setShowMenu(false);
  const handleShowMenu = () => setShowMenu(true);

  const debounce = <F extends (...args: any[]) => void>(func: F, waitFor: number) => {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<F>): void => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), waitFor);
    };
  };

  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY + 150;

    for (let i = headings.length - 1; i >= 0; i -= 1) {
      const heading = headings[i];
      const sectionElement = document.getElementById(heading.id);

      if (sectionElement && sectionElement.offsetTop <= scrollPosition) {
        setActiveLink(`#${heading.id}`);
        return;
      }
    }

    setActiveLink('');
  }, [headings]);

  useEffect(() => {
    const debouncedHandleScroll = debounce(handleScroll, 100);
    window.addEventListener('scroll', debouncedHandleScroll);

    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
    };
  }, [handleScroll]);

  const slugify = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const HeadingRenderer: React.FC<{ level: number; children: React.ReactNode }> = ({
    level,
    children,
  }) => {
    const title = React.Children.toArray(children)
      .join('')
      .replace(/^#+\s*/, '')
      .trim();
    const id = slugify(title);

    useEffect(() => {
      setHeadings((prev) => {
        if (prev.some((heading) => heading.id === id)) {
          return prev;
        }

        const nextHeading: Heading = {
          id,
          level,
          title,
          order: prev.length,
        };

        return [...prev, nextHeading].sort((a, b) => a.order - b.order);
      });
    }, [id, level, title]);

    switch (level) {
      case 1:
        return <h1 id={id}>{title}</h1>;
      case 2:
        return <h2 id={id}>{title}</h2>;
      case 3:
        return <h3 id={id}>{title}</h3>;
      case 4:
        return <h4 id={id}>{title}</h4>;
      case 5:
        return <h5 id={id}>{title}</h5>;
      case 6:
      default:
        return <h6 id={id}>{title}</h6>;
    }
  };

  const Sidebar: React.FC = () => {
    const mainHeadings = headings
      .filter((heading) => heading.level === 2)
      .sort((a, b) => a.order - b.order);
    const panelHeadings = headings
      .filter((heading) => heading.level === 4)
      .sort((a, b) => a.order - b.order);

    if (!mainHeadings.length) {
      return null;
    }

    return (
      <nav aria-label="Page sections">
        <Nav as="ul" className="flex-column sidebar-nav">
          {mainHeadings.map((heading) => {
            const displayTitle = heading.title.trim();
            const href = `#${heading.id}`;
            const isActive = activeLink === href;
            const isPanelsSection = heading.title.toLowerCase().includes('step 7');

            return (
              <Nav.Item as="li" key={heading.id} className="sidebar-item">
                <Nav.Link
                  href={href}
                  onClick={handleCloseMenu}
                  active={isActive}
                  aria-current={isActive ? 'location' : undefined}
                  className="sidebar-link"
                >
                  {displayTitle}
                </Nav.Link>

                {isPanelsSection && panelHeadings.length > 0 && (
                  <Nav
                    as="ul"
                    className="flex-column nav-sublist"
                    aria-label={`${displayTitle} subsections`}
                  >
                    {panelHeadings.map((panel) => {
                      const panelHref = `#${panel.id}`;
                      const panelActive = activeLink === panelHref;

                      return (
                        <Nav.Item as="li" key={panel.id} className="sidebar-subitem">
                          <Nav.Link
                            href={panelHref}
                            onClick={handleCloseMenu}
                            active={panelActive}
                            aria-current={panelActive ? 'location' : undefined}
                            className="sidebar-sublink"
                          >
                            {panel.title.trim()}
                          </Nav.Link>
                        </Nav.Item>
                      );
                    })}
                  </Nav>
                )}
              </Nav.Item>
            );
          })}
        </Nav>
      </nav>
    );
  };

  return (
    <div id="page-top">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header>
        <Navbar
          bg="light"
          expand="lg"
          className="shadow-sm"
          aria-label="Primary navigation"
        >
          <Container fluid>
            <Navbar.Brand href="#page-top">Observability Showcase</Navbar.Brand>
            <Navbar.Toggle
              aria-controls="offcanvas-navbar"
              onClick={handleShowMenu}
              aria-expanded={showMenu}
              aria-label="Toggle navigation menu"
            />
          </Container>
        </Navbar>
      </header>

      <Offcanvas
        show={showMenu}
        onHide={handleCloseMenu}
        responsive="lg"
        className="d-lg-none"
        placement="start"
        aria-labelledby="mobile-menu-title"
        id="offcanvas-navbar"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title id="mobile-menu-title">Navigation</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Sidebar />
        </Offcanvas.Body>
      </Offcanvas>

      <Container fluid className="main-layout">
        <Row>
          <Col
            lg={3}
            as="aside"
            className="d-none d-lg-block sidebar-container"
            aria-label="Section navigation"
          >
            <div className="sidebar-sticky">
              <h2 className="sidebar-title">Observability Showcase</h2>
              <Sidebar />
            </div>
          </Col>

          <Col lg={9} as="main" id="main-content" className="main-content" tabIndex={-1}>
            <div className="mb-4 intro-actions">
              <div className="alert alert-warning" role="alert">
                <strong>⚠️ Dashboard Temporarily Unavailable</strong>
                <p className="mb-0 mt-2">
                  The live Grafana dashboard is currently taken down due to cloud infrastructure costs.
                  The showcase content below demonstrates the complete observability implementation.
                </p>
              </div>
            </div>

            {isLoading && (
              <div className="loading-state" role="status" aria-live="polite">
                <span className="spinner-border text-primary" role="presentation" />
                <span className="ms-3">Loading showcase content…</span>
              </div>
            )}

            {loadError && (
              <div className="alert alert-danger" role="alert">
                {loadError}
              </div>
            )}

            {!isLoading && !loadError && (
              <div className="content-sections">
                {sections.map((section, index) => (
                  <Card className="mb-4" key={index} as="article">
                    <Card.Body>
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          h1: ({ children }) => <HeadingRenderer level={1}>{children}</HeadingRenderer>,
                          h2: ({ children }) => <HeadingRenderer level={2}>{children}</HeadingRenderer>,
                          h3: ({ children }) => <HeadingRenderer level={3}>{children}</HeadingRenderer>,
                          h4: ({ children }) => <HeadingRenderer level={4}>{children}</HeadingRenderer>,
                          h5: ({ children }) => <HeadingRenderer level={5}>{children}</HeadingRenderer>,
                          h6: ({ children }) => <HeadingRenderer level={6}>{children}</HeadingRenderer>,
                          code({ node, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return match ? (
                              <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {section}
                      </ReactMarkdown>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default App;
