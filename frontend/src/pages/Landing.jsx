import Backdrop from '../components/site/Backdrop.jsx';
import Navbar from '../components/site/Navbar.jsx';
import LineSidebar from '../components/site/LineSidebar.jsx';
import Footer from '../components/site/Footer.jsx';
import Hero from '../components/site/sections/Hero.jsx';
import WhatIsIt from '../components/site/sections/WhatIsIt.jsx';
import HowItWorks from '../components/site/sections/HowItWorks.jsx';
import Roles from '../components/site/sections/Roles.jsx';
import Roadmap from '../components/site/sections/Roadmap.jsx';
import CTA from '../components/site/sections/CTA.jsx';

export default function Landing() {
  return (
    <div className="relative min-h-screen">
      <Backdrop />
      <Navbar variant="landing" />
      <LineSidebar />
      <main>
        <Hero />
        <WhatIsIt />
        <HowItWorks />
        <Roles />
        <Roadmap />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
