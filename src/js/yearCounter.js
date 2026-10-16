const counter = document.querySelector("[data-year-counter]");

if (counter) {
  const startYear = 1966;
  const endYear = 2026;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    counter.textContent = endYear.toString();
  } else {
    let year = startYear;
    let step = 0;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    const tick = () => {
      year = year >= endYear ? startYear : year + 1;
      const angle = step * goldenAngle;
      const radius = Math.sqrt((step % 21) + 1) * 1.5;
      counter.style.setProperty("--year-x", `${Math.cos(angle) * radius}px`);
      counter.style.setProperty("--year-y", `${Math.sin(angle) * radius}px`);
      counter.style.setProperty("--year-rotation", `${Math.sin(angle) * 3}deg`);
      counter.classList.add("is-leaving");

      window.setTimeout(() => {
        counter.textContent = year.toString();
        counter.classList.remove("is-leaving");
        step += 1;
        window.setTimeout(tick, 1500);
      }, 750);
    };

    window.setTimeout(tick, 1800);
  }
}
