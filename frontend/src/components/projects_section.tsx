import styles from "../styles/components/projects_section.module.scss";
import projects from "../../public/projects.json"
import Image from "next/image"

let PROJECTS_PATH = "/projects/"

export default function ProjectsSection() {

    return (
        <div className={styles.main}>
            <div className={styles.heading}>
                <h2>CHECK OUT</h2>
                <h1>Our Projects</h1>
            </div>
            <div className={styles.projects}>
                {projects.projects.map((item, idx) => {
                    return (
                        <div className={styles.project} key={idx}>
                            <h1>{item.name}</h1>
                            <div className={styles.projectImage}>
                                <a href={item.href} target="_blank">
                                    <Image
                                        src={PROJECTS_PATH + item.img}
                                        alt={item.name}
                                        fill
                                    />
                                </a>
                            </div>
                        </div>
                    );
                })
                }
            </div >
        </div>
    );

}

