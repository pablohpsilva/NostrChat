import { Link } from "react-router-dom";
import { APP_NAME } from "../../consts";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">{APP_NAME}</h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link to="/login" className="hover:text-black/80">
                  Login
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4">{children}</main>

      <footer className="border-t-solid border-t-black/10 border-t-[1px] p-4">
        <div className="container mx-auto text-center">
          <p>
            © {new Date().getFullYear()} {APP_NAME}
          </p>
        </div>
      </footer>
    </>
  );
}

export default Layout;
