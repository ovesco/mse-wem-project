function Spinner(props: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className={`${props.className} animate-spin`}>
      <path fill="#444444" d="M9.9 0.2l-0.2 1c3 0.8 5.3 3.5 5.3 6.8 0 3.9-3.1 7-7 7s-7-3.1-7-7c0-3.3 2.3-6 5.3-6.8l-0.2-1c-3.5 0.9-6.1 4.1-6.1 7.8 0 4.4 3.6 8 8 8s8-3.6 8-8c0-3.7-2.6-6.9-6.1-7.8z"></path>
    </svg>
  );
}

export default Spinner;