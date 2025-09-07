import styles from "./welcome.module.css";

export default function Welcome() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#D9EAB0]">
      <section className={styles.stage}>
        {/* Title (image) */}
        <div className={styles.title}>
          <img
            src="/sprites/bunny_care_header.png"
            alt="Bunny Care Tracker"
            className={`${styles.img} pixel`}
            draggable={false}
          />
        </div>

        {/* Treats */}
        <div className={styles.treatLeft}>
          <img src="/sprites/treat.png" alt="Carrot left" className={`${styles.img} pixel`} />
        </div>
        <div className={styles.treatRight}>
          <img src="/sprites/treat.png" alt="Carrot right" className={`${styles.img} pixel`} />
        </div>

        {/* Plant / Lamp / Books */}
        <div className={styles.plant}>
          <img src="/sprites/plant_loading.png" alt="Plant" className={`${styles.img} pixel`} />
        </div>
        <div className={styles.lamp}>
          <img src="/sprites/lamb.png" alt="Lamp" className={`${styles.img} pixel`} />
        </div>
        <div className={styles.books}>
          <img src="/sprites/book_green.png" alt="Books" className={`${styles.img} pixel`} />
        </div>

        {/* Bunny GIF */}
        <div className={styles.bunny}>
          <img src="/animations/bunny_loading.gif" alt="Bunny gif" className={`${styles.img} pixel`} />
        </div>

        {/* Welcome button */}
        <div className={styles.welcomeBox}>
          <button className={styles.welcomeButton}>Welcome</button>
          {/* plus tard: <Link href="/home"><button .../></Link> */}
        </div>
      </section>
    </main>
  );
}
