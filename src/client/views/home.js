import React from "react";
import PlayGame from "../components/play-game";

const Home = () => {
    return (
        <div className = "justify-content-center" style={{ maxWidth: "780px", marginTop: "3%", margin: "auto" }}>            
            <PlayGame></PlayGame>
        </div>
    );
};

export default Home;