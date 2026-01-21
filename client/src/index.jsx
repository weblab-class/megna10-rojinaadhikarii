import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./components/App";
import Skeleton from "./components/pages/HomePage";
import DiscoverFeed from "./components/pages/DiscoverFeed";
import Profile from "./components/pages/Profile";
import NotFound from "./components/pages/NotFound";

// ADD THIS IMPORT
import StudyCorner from "./components/modules/StudyCorner";

const GOOGLE_CLIENT_ID = "137280062366-iij7765um7mo7h3ro161thrp1dgnqn1s.apps.googleusercontent.com";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Skeleton />} />
          <Route path="discovery" element={<DiscoverFeed />} />
          {/* <Route path="profile" element={<Profile />} /> */}
          <Route path="studycorner" element={<StudyCorner />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </GoogleOAuthProvider>
);
