import type { ReactNode } from 'react';

// what the switched-off accessibility rules would flag, and the `role="list"` exception — none of it may be reported
export const Off = ({ onClose }: { onClose: () => void }): ReactNode => (
  <main>
    <div onClick={onClose} />
    <li onClick={onClose}>close</li>
    <a onClick={onClose}>close</a>
    <div tabIndex={0}>scrollable</div>
    <input autoFocus />
    <label>Name</label>
    <video src="/x.mp4" />
    <a href="/x">click here</a>
    <iframe src="https://example.com" />
    <marquee>news</marquee>
    <div onMouseOver={onClose} />
    <ul role="list">
      <li>a</li>
    </ul>
    <ol role="list">
      <li>a</li>
    </ol>
  </main>
);
