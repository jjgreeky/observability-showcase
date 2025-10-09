






import React, { useState, useEffect, useCallback } from 'react';



import { Container, Row, Col, Navbar, Nav, Offcanvas, NavDropdown, Card } from 'react-bootstrap';



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



}







const App: React.FC = () => {



  const [sections, setSections] = useState<string[]>([]);



  const [headings, setHeadings] = useState<Heading[]>([]);



  const [showMenu, setShowMenu] = useState(false);



  const [activeLink, setActiveLink] = useState('');







  useEffect(() => {



    const cacheBuster = new Date().getTime();



    fetch(`${process.env.PUBLIC_URL}/HOMEWORK_SOLUTION_SUMMARY.md?v=${cacheBuster}`)



      .then((response) => response.text())



      .then((text) => {



        const sectionsArray = text.split('---').map(s => s.trim());



        setSections(sectionsArray);



      });



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



    const sections = headings.map(h => document.getElementById(h.id));



    const scrollPosition = window.scrollY + 150;







    for (let i = sections.length - 1; i >= 0; i--) {



      const section = sections[i];



      if (section && section.offsetTop <= scrollPosition) {



        setActiveLink(`#${section.id}`);



        break;



      }



    }



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







  const HeadingRenderer: React.FC<{ level: number, children: React.ReactNode }> = ({ level, children }) => {



    const title = React.Children.toArray(children).join('').replace(/^#+\s*/, '');



    const id = slugify(title);







    useEffect(() => {



      setHeadings(prev => {



        if (prev.find(h => h.id === id)) return prev;



        return [...prev, { id, level, title }].sort((a, b) => a.id.localeCompare(b.id));



      });



    }, [id, level, title]);







    switch (level) {



      case 1: return <h1 id={id}>{title}</h1>;



      case 2: return <h2 id={id}>{title}</h2>;



      case 3: return <h3 id={id}>{title}</h3>;



      case 4: return <h4 id={id}>{title}</h4>;



      case 5: return <h5 id={id}>{title}</h5>;



      case 6: return <h6 id={id}>{title}</h6>;



      default: return <h6 id={id}>{title}</h6>;



    }



  };







  const Sidebar = () => {



    const mainHeadings = headings.filter(h => h.level === 2);



    const panelHeadings = headings.filter(h => h.level === 4);







    return (



      <Nav className="flex-column">



        {mainHeadings.map(heading => {



          if (heading.title.includes('Step 7')) {



            return (



              <NavDropdown title="Dashboard Panels" id="nav-dropdown" key={heading.id}>



                {panelHeadings.map(panel => (



                  <NavDropdown.Item key={panel.id} href={`#${panel.id}`} onClick={handleCloseMenu}>



                    {panel.title.replace(/^\d+\.\s*/, '')}



                  </NavDropdown.Item>



                ))}



              </NavDropdown>



            );



          }



          return (



            <Nav.Link 



              key={heading.id} 



              href={`#${heading.id}`}



              onClick={handleCloseMenu}



              active={activeLink === `#${heading.id}`}



            >



              {heading.title}



            </Nav.Link>



          );



        })}



      </Nav>



    );



  };







  return (



    <>



      <Navbar bg="primary" variant="dark" expand="lg" fixed="top" className="d-lg-none">



        <Container fluid>



          <Navbar.Brand href="#">Observability Showcase</Navbar.Brand>



          <Navbar.Toggle aria-controls="offcanvas-navbar" onClick={handleShowMenu} />



        </Container>



      </Navbar>







      <Offcanvas show={showMenu} onHide={handleCloseMenu} responsive="lg" className="d-lg-none">



        <Offcanvas.Header closeButton>



          <Offcanvas.Title>Menu</Offcanvas.Title>



        </Offcanvas.Header>



        <Offcanvas.Body>



          <Sidebar />



        </Offcanvas.Body>



      </Offcanvas>







      <Container fluid>



        <Row>



          <Col lg={3} className="d-none d-lg-block sidebar-container">



            <div className="sidebar-sticky">



              <h5 className="px-3">Observability Showcase</h5>



              <Sidebar />



            </div>



          </Col>



          <Col lg={9} className="main-content">



            <div className="mb-4">



              <a



                href="https://jonathantschetterjr.grafana.net/public-dashboards/c5368a906f9547ddb6b2c9e073225de2"



                target="_blank"



                rel="noopener noreferrer"



                className="btn btn-primary btn-lg"



                aria-describedby="dashboard-description"



              >



                📊 View Live Grafana Dashboard



              </a>



              <p id="dashboard-description" className="text-muted small">



                Opens the live dashboard showing real-time metrics, logs, and traces from the deployed observability stack.



              </p>



              <div className="alert alert-info mt-2" role="note">



                <strong>Note:</strong> You'll need to toggle the app on/off to generate metrics, logs, and traces due to cost considerations. The dashboard will show data when traffic is actively being generated.



              </div>



            </div>



            <hr />



            {sections.map((section, index) => (



              <Card className="mb-4" key={index}>



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



          </Col>



        </Row>



      </Container>



    </>



  );



};







export default App;




