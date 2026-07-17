import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './text-type.css';

export default function TextType({ text, typingSpeed = 70, pauseDuration = 2000, className = '', textColors = [], cursorCharacter = '|' }) {
  const phrases = Array.isArray(text) ? text : [text];
  const [phrase, setPhrase] = useState(0);
  const [shown, setShown] = useState('');
  const [deleting, setDeleting] = useState(false);
  const cursor = useRef(null);
  useEffect(() => { gsap.to(cursor.current, { opacity: .15, duration: .5, repeat: -1, yoyo: true }); }, []);
  useEffect(() => {
    const current = phrases[phrase];
    const finished = shown === current;
    const empty = shown === '';
    const wait = deleting ? 32 : finished ? pauseDuration : typingSpeed;
    const timer = setTimeout(() => {
      if (finished && !deleting) return setDeleting(true);
      if (deleting && empty) { setDeleting(false); return setPhrase((phrase + 1) % phrases.length); }
      setShown(v => deleting ? v.slice(0, -1) : current.slice(0, v.length + 1));
    }, wait);
    return () => clearTimeout(timer);
  }, [shown, deleting, phrase, phrases, typingSpeed, pauseDuration]);
  return <span className={`text-type ${className}`} style={{ color: textColors[phrase % textColors.length] }}><span>{shown}</span><i ref={cursor}>{cursorCharacter}</i></span>;
}
