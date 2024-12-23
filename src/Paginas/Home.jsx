import React from "react";
import "./Home.css";

const Redirect = () => {
  window.location.href = "/tienda"; 
};

export default function Home() {
  return (
    <div className="home-container">
      <section className="hero-section">
        <picture>
          <source 
            media="(max-width: 480px)"
            srcSet="https://images.unsplash.com/photo-1506617420156-8e4536971650?ixlib=rb-4.0.3&w=480&h=320&fit=crop"
          />
          <source 
            media="(max-width: 768px)"
            srcSet="https://images.unsplash.com/photo-1506617420156-8e4536971650?ixlib=rb-4.0.3&w=600&h=400&fit=crop"
          />
          <source 
            media="(max-width: 1200px)"
            srcSet="https://images.unsplash.com/photo-1506617420156-8e4536971650?ixlib=rb-4.0.3&w=800&h=500&fit=crop"
          />
          <img 
            src="https://images.unsplash.com/photo-1506617420156-8e4536971650?ixlib=rb-4.0.3&w=800&h=500&fit=crop"
            alt="Productos frescos y saludables"
            className="hero-image"
            loading="lazy"
            style={{
              maxWidth: '100%',
              height: 'auto',
              objectFit: 'cover'
            }}
          />
        </picture>
        <button className="cta-button" onClick={Redirect}>
          Ver Ofertas
        </button>
      </section>

      <section className="about-section">
        <h2 className="section-title">Nuestra Misión</h2>
        <div className="about-content">
          <p>
            En ¡Que No Se Pierda! trabajamos para reducir el desperdicio de alimentos
            conectando negocios locales con consumidores conscientes. Ofrecemos:
          </p>
          <ul>
            <li>Productos cerca de su fecha de caducidad a precios reducidos</li>
            <li>Apoyo a comercios locales</li>
            <li>Impacto positivo en el medio ambiente</li>
            <li>Ahorro para los consumidores</li>
            <li>Plataforma fácil de usar</li>
          </ul>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">¿Cómo Funciona?</h2>
        <div className="features-grid">
          <article className="feature-card">
            <h3>Negocios Publican</h3>
            <p>Los comercios suben sus productos con descuento antes de que caduquen.</p>
          </article>
          <article className="feature-card">
            <h3>Tú Compras</h3>
            <p>Encuentras ofertas increíbles en productos de calidad.</p>
          </article>
          <article className="feature-card">
            <h3>Todos Ganamos</h3>
            <p>Reduces el desperdicio mientras ahorras dinero.</p>
          </article>
        </div>
      </section>

      <section className="products-section">
        <h2 className="section-title">Categorías Populares</h2>
        <div className="products-preview">
          <article className="product-card">
            <picture>
              <source 
                media="(max-width: 480px)"
                srcSet="https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=480"
              />
              <source 
                media="(max-width: 768px)"
                srcSet="https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=768"
              />
              <img 
                src="https://images.unsplash.com/photo-1608686207856-001b95cf60ca"
                alt="Panadería y repostería"
                loading="lazy"
              />
            </picture>
            <h3>Panadería</h3>
            <p>Pan fresco y productos horneados a precios increíbles.</p>
          </article>
          <article className="product-card">
            <picture>
              <source 
                media="(max-width: 480px)"
                srcSet="https://images.unsplash.com/photo-1542838132-92c53300491e?w=480"
              />
              <source 
                media="(max-width: 768px)"
                srcSet="https://images.unsplash.com/photo-1542838132-92c53300491e?w=768"
              />
              <img 
                src="https://images.unsplash.com/photo-1542838132-92c53300491e"
                alt="Frutas y verduras frescas"
                loading="lazy"
              />
            </picture>
            <h3>Frutas y Verduras</h3>
            <p>Productos frescos locales a precios reducidos.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
