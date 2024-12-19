import React from "react";

const Redirect = () => {
  window.location.href = "/tienda";
};

export default function Home() {
  return (
    <div>
      <h1>Somos la mejor pagina de productos del mercado</h1>
      <p>¡Bienvenido a nuestra tienda!</p>
      <img src="https://via.placeholder.com/150" alt="placeholder" />
      <button onClick={Redirect}>Ir a tienda</button>
      <section>
        <h1>Sobre nosotros</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
          consectetur, augue nec ultricies ultricies, nunc nisl ultricies
          sapien, nec ultricies felis felis nec massa. Sed non felis eget ligula
          ultricies suscipit. Sed nec purus in libero aliqu
        </p>
      </section>
      <section>
        <h1>Nuestros mejores productos</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
          consectetur, augue nec ultricies ultricies, nunc nisl ultricies
          sapien, nec ultricies felis felis nec massa. Sed non felis eget ligula
          ultricies suscipit. Sed nec purus in libero aliqu
        </p>
      </section>
    </div>
  );
}
