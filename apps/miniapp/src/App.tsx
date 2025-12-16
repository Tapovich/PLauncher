/**
 * Main App Component with Routing
 */

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// Pages
import { Home } from "@/pages/Home";
import { AIChat } from "@/pages/AIChat";
import { IdeaResults } from "@/pages/IdeaResults";
import { Loading } from "@/pages/Loading";
import { TechSpec } from "@/pages/TechSpec";
import { Marketplace } from "@/pages/Marketplace";
import { DFY } from "@/pages/DFY";
import { Success } from "@/pages/Success";
import { Payments } from "@/pages/Payments";

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

// Animated routes wrapper
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Home />
            </motion.div>
          }
        />
        <Route
          path="/ai-chat"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AIChat />
            </motion.div>
          }
        />
        <Route
          path="/idea-results"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <IdeaResults />
            </motion.div>
          }
        />
        <Route
          path="/loading"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Loading />
            </motion.div>
          }
        />
        <Route
          path="/tech-spec"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <TechSpec />
            </motion.div>
          }
        />
        <Route
          path="/marketplace"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Marketplace />
            </motion.div>
          }
        />
        <Route
          path="/dfy"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <DFY />
            </motion.div>
          }
        />
        <Route
          path="/success"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Success />
            </motion.div>
          }
        />
        <Route
          path="/payments"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Payments />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;

