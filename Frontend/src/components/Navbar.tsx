import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Leaf, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardPath = user?.role === 'doctor' ? '/doctor-dashboard' : '/user-dashboard';

  return (
    <nav className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">

        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary rounded-full p-1.5">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-xl text-foreground">AgriPet AI</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">

          {/* <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link> */}

          <a href="/#hero" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" >Home</a>

          <a href="/#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>

          <a href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>



          {/* {
            !isAuthenticated ? (
              <>
                <a href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>

          <a href="/#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>

              </>
            ) : null
          } */}

          {isAuthenticated ? (
            <>
              {/*               
               <a href="/user-dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Book Appointments</a>

               <a href="/user-dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Status</a> */}

              <Link to={dashboardPath}>
                <Button size="sm">Dashboard</Button>
              </Link>
              <Button size="sm" variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </Button>
            </>
          ) : (
            <>
              {/* <Link to="/login"><Button variant="outline" size="sm">Login</Button></Link>
              <Link to="/signup"><Button size="sm">Sign Up</Button></Link> */}
              <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Login</Link>
              <Link to="/signup" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sign Up</Link>
            </>
          )}

        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-card px-4 py-4 space-y-3">
          <Link to="/" className="block text-sm" onClick={() => setOpen(false)}>Home</Link>
          <a href="/#features" className="block text-sm" onClick={() => setOpen(false)}>Features</a>
          <a href="/#about" className="block text-sm" onClick={() => setOpen(false)}>About</a>
          {isAuthenticated ? (
            <>
              <Link to={dashboardPath} onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full">Dashboard</Button>
              </Link>
              <Button size="sm" variant="outline" className="w-full" onClick={() => { handleLogout(); setOpen(false); }}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)}><Button variant="outline" size="sm" className="w-full">Login</Button></Link>
              <Link to="/signup" onClick={() => setOpen(false)}><Button size="sm" className="w-full">Sign Up</Button></Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
