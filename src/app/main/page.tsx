"use client";

import { useEffect, useState } from "react";

export default function HallOfShamePage() {
  const [submissions, setSubmissions] = useState([
    {
      id: 1,
      name: "Color Calamity",
      creator: "DesignerDan",
      imageUrl: "https://placehold.co/600x400/ff00ff/FFFFFF?text=Awful+Colors",
      description: "A masterpiece of clashing colors and unreadable text.",
      votes: 15,
    },
    {
      id: 2,
      name: "Button Bonanza",
      creator: "ClickClack",
      imageUrl: "https://placehold.co/600x400/0000ff/FFFFFF?text=Too+Many+Buttons",
      description: "Features 57 buttons on the homepage.",
      votes: 28,
    },
    {
      id: 3,
      name: "The Endless Form",
      creator: "FormidableFoe",
      imageUrl: "https://placehold.co/600x400/00ff00/000000?text=Infinite+Form",
      description: "A form with 112 fields including your pet’s BFF.",
      votes: 8,
    },
    {
      id: 4,
      name: "Mystery Meat Nav",
      creator: "IconiclyBad",
      imageUrl: "https://placehold.co/600x400/ffff00/000000?text=What+is+This%3F",
      description: "Navigation of abstract icons, no tooltips. Surprise!",
      votes: 22,
    },
    {
      id: 5,
      name: "Popup Pandemonium",
      creator: "AlertAddict",
      imageUrl: "https://placehold.co/600x400/f87171/000000?text=Popups+Everywhere",
      description: "Every click opens a new popup ad. Chaos guaranteed.",
      votes: 12,
    },
    {
      id: 6,
      name: "Comic Sans Hell",
      creator: "FontFiasco",
      imageUrl: "https://placehold.co/600x400/facc15/000000?text=Comic+Sans+Overload",
      description: "Everything in Comic Sans. Even the error messages.",
      votes: 17,
    },
  ]);

  const [votedId, setVotedId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Mark that we're on the client
    const savedVote = localStorage.getItem("voted_submission");
    if (savedVote) setVotedId(parseInt(savedVote));

    const storedName = localStorage.getItem("loggedInUser");
    if (storedName) setUsername(storedName);
  }, []);

  const handleVote = (id: number) => {
    if (votedId === id) return;

    const updated = submissions.map((s) => {
      if (votedId && s.id === votedId && s.votes > 0) {
        return { ...s, votes: s.votes - 1 };
      }
      if (s.id === id) {
        return { ...s, votes: s.votes + 1 };
      }
      return s;
    });

    setSubmissions(updated);
    setVotedId(id);
    localStorage.setItem("voted_submission", id.toString());
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("voted_submission");
    setUsername(null);
    window.location.href = "/login"; // redirect to login page
  };

  const sortedSubs = [...submissions].sort((a, b) => b.votes - a.votes);

  return (
    
    <div className="min-h-screen bg-gray-950 text-gray-200 font-[Inter] relative">

      {/* Submit Entry button - top left */}
      <div className="absolute top-4 left-4">
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors"
          onClick={() => alert("Submission form coming soon!")}
        >
          Submit Entry
        </button>
      </div>

      {/* Top right username + logout */}
      {mounted && username && (
        <div className="absolute top-4 right-4 flex items-center space-x-3 bg-gray-800 px-4 py-2 rounded-lg shadow">
          <span className="text-green-400 font-semibold">{username}</span>
          <button
            onClick={handleLogout}
            className="bg-orange-500 hover:bg-orange-600 text-gray-900 font-semibold px-3 py-1 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      )}

      <div className="container mx-auto p-4 md:p-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 mb-3">
            Hall of Shame
          </h1>
          <p className="text-lg text-gray-400 mb-2">
            The Official Worst UI Competition Leaderboard
          </p>
          {mounted && username && (
            <p className="text-md text-green-400 font-semibold">
                Welcome, {username}!
            </p>
          )}
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submissions */}
          <section className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 border-l-4 border-indigo-500 pl-4">
              Vote for the Worst
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedSubs.map((submission) => {
                const isVoted = votedId === submission.id;
                return (
                  <div
                    key={submission.id}
                    className="bg-gray-800 rounded-xl shadow-md overflow-hidden transition-transform transform hover:scale-105 duration-300"
                  >
                    <img
                      src={submission.imageUrl}
                      alt={submission.name}
                      className="w-full h-36 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-bold mb-1">{submission.name}</h3>
                      <p className="text-xs text-gray-400 mb-2">
                        By: {submission.creator}
                      </p>
                      <p className="text-sm text-gray-300 mb-3">{submission.description}</p>
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => handleVote(submission.id)}
                          className={`${
                            isVoted ? "bg-green-600" : "bg-indigo-600 hover:bg-indigo-700"
                          } text-white font-bold py-1.5 px-3 rounded-lg text-sm transition-colors duration-300`}
                        >
                          {isVoted ? "Your Vote" : "Vote for Worst"}
                        </button>
                        <span className="text-base font-bold text-indigo-400">
                          {submission.votes} Votes
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Leaderboard */}
          <aside>
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg sticky top-8">
              <h2 className="text-2xl font-bold mb-6 border-l-4 border-green-500 pl-4">
                Leaderboard
              </h2>
              <ul className="space-y-4">
                {sortedSubs.map((submission, index) => {
                  const rank = index + 1;
                  let rankIcon = "";
                  let bgColor = "bg-gray-700/50 hover:bg-gray-700";

                  if (rank === 1) {
                    rankIcon = "🥇";
                    bgColor = "bg-yellow-500/20 hover:bg-yellow-500/30";
                  } else if (rank === 2) {
                    rankIcon = "🥈";
                    bgColor = "bg-gray-400/20 hover:bg-gray-400/30";
                  } else if (rank === 3) {
                    rankIcon = "🥉";
                    bgColor = "bg-orange-600/20 hover:bg-orange-600/30";
                  }

                  return (
                    <li
                      key={submission.id}
                      className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${bgColor}`}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl font-bold w-10 text-center">{rankIcon || rank}</span>
                        <div>
                          <p className="font-bold text-white">{submission.name}</p>
                          <p className="text-xs text-gray-400">{submission.creator}</p>
                        </div>
                      </div>
                      <span className="text-base font-extrabold text-green-400">{submission.votes}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </main>

        <footer className="text-center mt-16 text-gray-500 text-sm">
          <p>
            &copy; 2025 The Worst UI Competition. All rights reserved… unfortunately.
          </p>
        </footer>
      </div>
    </div>
  );
}

