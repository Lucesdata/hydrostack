import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section style={{
        padding: '8rem 0 6rem',
        textAlign: 'center',
        backgroundColor: 'var(--color-gray-light)',
      }}>
        <div className="container">
          <h1 style={{
            fontSize: '4rem',
            fontWeight: 800,
            marginBottom: '1.5rem',
            color: 'var(--color-foreground)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em'
          }}>
            HYDROSTACK
          </h1>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: 500,
            color: 'var(--color-primary)',
            marginBottom: '1rem',
            maxWidth: '900px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.3
          }}>
            Plataforma digital para el diseño y desarrollo de proyectos de agua y saneamiento.
          </h2>
          <p style={{
            fontSize: '1.25rem',
            color: 'var(--color-gray-dark)',
            marginBottom: '3rem',
            maxWidth: '800px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Desde soluciones comunitarias hasta sistemas urbanos, industriales y marinos.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/register">
              <Button variant="primary" style={{ fontSize: '1.2rem', padding: '16px 32px' }}>
                Comienza tu primer proyecto
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" style={{ fontSize: '1.2rem', padding: '16px 32px' }}>
                Iniciar sesión
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section style={{ padding: '6rem 0', borderBottom: '1px solid var(--color-gray-medium)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '900px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--color-foreground)' }}>¿Qué es HYDROSTACK?</h2>
          <p style={{ fontSize: '1.25rem', lineHeight: 1.6, color: 'var(--color-foreground)' }}>
            HYDROSTACK es una plataforma digital que acompaña la formulación y desarrollo de proyectos de agua potable, saneamiento y tratamiento de aguas en distintos contextos y escalas, integrando ingeniería, gestión y tecnología.
          </p>
        </div>
      </section>

      {/* New Section: Start First Project */}
      <section style={{ padding: '6rem 0', backgroundColor: 'var(--color-background)' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '1.5rem', color: 'var(--color-primary)', fontWeight: 700 }}>
              Tu primer proyecto, simplificado
            </h2>
            <p style={{ fontSize: '1.25rem', lineHeight: 1.6, color: 'var(--color-gray-dark)', marginBottom: '3rem' }}>
              Ya no necesitas hojas de cálculo dispersas. Con HydroStack, estructuras tu proyecto de agua potable paso a paso, desde la población hasta el diseño de la red.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2rem',
              width: '100%',
              marginBottom: '3rem'
            }}>
              {[
                { title: "1. Regístrate", desc: "Crea tu cuenta en segundos y accede al panel de control." },
                { title: "2. Define", desc: "Ingresa los datos de población y parámetros básicos." },
                { title: "3. Diseña", desc: "Obtén cálculos automáticos y genera reportes profesionales." }
              ].map((step, idx) => (
                <div key={idx} style={{ padding: '1.5rem', backgroundColor: 'var(--color-gray-light)', borderRadius: 'var(--radius-md)' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-foreground)', marginBottom: '0.5rem' }}>{step.title}</h3>
                  <p style={{ color: 'var(--color-gray-dark)' }}>{step.desc}</p>
                </div>
              ))}
            </div>

            <Link href="/register">
              <Button variant="primary">Empezar ahora</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Project Types Section */}
      <section style={{ padding: '6rem 0', backgroundColor: 'var(--color-gray-light)' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', marginBottom: '3rem', color: 'var(--color-foreground)', textAlign: 'center' }}>¿Qué tipo de proyectos se pueden realizar?</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {[
              "Proyectos de agua potable rurales y urbanos",
              "Sistemas de potabilización para residencias privadas, clubes y conjuntos",
              "Plantas de desalinización para hoteles, embarcaciones e instalaciones costeras",
              "Plantas de tratamiento de aguas residuales comunitarias y municipales",
              "Tratamiento y descontaminación de aguas industriales"
            ].map((item, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                border: '1px solid transparent',
                transition: 'border-color 0.2s'
              }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--color-foreground)' }}>{item}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: '1.25rem', fontStyle: 'italic', color: 'var(--color-primary)', fontWeight: 500 }}>
            Una sola plataforma para múltiples realidades del agua.
          </p>
        </div>
      </section>

      {/* Who is it for & Vision */}
      <section style={{ padding: '6rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem' }}>
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--color-primary)' }}>¿Para quién es?</h2>
              <ul style={{ listStyle: 'none', lineHeight: 1.8, fontSize: '1.1rem' }}>
                {([
                  "Comunidades y organizaciones locales",
                  "Operadores y acueductos",
                  "Ingenieros y profesionales técnicos",
                  "Empresas, industrias y desarrolladores",
                  "Entidades públicas, ONGs y consultores"
                ]).map((item, i) => (
                  <li key={i} style={{ paddingLeft: '1.5rem', position: 'relative', marginBottom: '0.5rem' }}>
                    <span style={{ position: 'absolute', left: 0, color: 'var(--color-primary)' }}>•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--color-primary)' }}>Nuestra Visión</h2>
              <p style={{ fontSize: '1.25rem', lineHeight: 1.6, color: 'var(--color-foreground)' }}>
                Facilitar que proyectos de agua bien diseñados, sostenibles y responsables se conviertan en realidad, independientemente de su escala o complejidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        padding: '6rem 0',
        backgroundColor: 'var(--color-foreground)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 700 }}>
            HYDROSTACK es más que una herramienta.
          </h2>
          <p style={{ fontSize: '1.5rem', marginBottom: '3rem', opacity: 0.9 }}>
            Es un entorno completo para pensar, diseñar y estructurar proyectos de agua.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Link href="/register">
              <Button variant="primary" style={{ fontSize: '1.25rem', padding: '16px 40px', backgroundColor: 'var(--color-primary)', border: 'none' }}>
                Suscríbete y realiza tu primer proyecto
              </Button>
            </Link>
            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
              Únete hoy y lleva tus proyectos de agua al siguiente nivel.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
