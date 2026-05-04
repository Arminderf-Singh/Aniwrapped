import '../styles/globals.css';

export const metadata = {
  title: 'AniWrapped; Your Anime Year in Review',
  description: 'Discover your anime watching patterns, stats, and taste profile.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="petal-layer">
          {[
            { left: '8%',  delay: '0s',   duration: '8s',  size: 10 },
            { left: '22%', delay: '2.5s', duration: '11s', size: 7  },
            { left: '38%', delay: '5s',   duration: '9s',  size: 12 },
            { left: '58%', delay: '1s',   duration: '13s', size: 8  },
            { left: '74%', delay: '7s',   duration: '10s', size: 9  },
            { left: '89%', delay: '3.5s', duration: '12s', size: 7  },
          ].map((p, i) => (
            <div
              key={i}
              className="petal"
              style={{
                left: p.left,
                width: p.size,
                height: p.size,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </div>
        {children}
      </body>
    </html>
  );
}