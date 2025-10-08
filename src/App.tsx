import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Nav, Button } from 'react-bootstrap';
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
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Add cache-busting parameter
    const cacheBuster = new Date().getTime();
    fetch(`${process.env.PUBLIC_URL}/HOMEWORK_SOLUTION_SUMMARY.md?v=${cacheBuster}`)
      .then((response) => response.text())
      .then((text) => {
        const parsedSteps = parseMarkdown(text);
        setSteps(parsedSteps);
        stepRefs.current = stepRefs.current.slice(0, parsedSteps.length);
      })
      .catch((error) => console.error('Error loading markdown:', error));
  }, []);

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
  };

  return (
    <Container fluid>
      <Row>
        <Col md={2} className="sidebar d-none d-md-block">
          <Nav className="flex-column sidebar-sticky">
            <Nav.Item>
              <Nav.Link onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Introduction
              </Nav.Link>
            </Nav.Item>
            {steps.map((step, index) => (
              <Nav.Item key={index}>
                <Nav.Link onClick={() => scrollToStep(index)}>
                  {step.title.split(':')[0]}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Col>
        <Col xs={12} md={10} className="main-content">
          <div ref={el => { stepRefs.current[0] = el; }}>
            <h1>Observability Stack Implementation: A Step-by-Step Guide</h1>
            <p>This interactive guide walks you through the process of deploying a complete observability stack on GKE.</p>
            <div className="mb-4">
              <Button
                variant="primary"
                size="lg"
                href="https://jonathantschetterjr.grafana.net/public-dashboards/1aa3c3d5f8b74c9e9ceca2d577a6100d"
                target="_blank"
                rel="noopener noreferrer"
              >
                📊 View Live Grafana Dashboard
              </Button>
            </div>
          </div>
          {steps.map((step, index) => (
            <div key={index} ref={el => { stepRefs.current[index] = el; }} id={step.id}>
              <Step
                title={step.title}
                description={step.description}
              />
            </div>
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default App;
