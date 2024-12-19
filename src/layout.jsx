import Navbar from "./components/Navbar";
import Footer from "./components/footer";

export const Layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
};
