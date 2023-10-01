import styles from "../styles/board.module.scss";
import projects from "@/public/data/projects.json"
import Image from "next/image"
import boardMembers from "@/public/data/board.json"

export default function Board() {

    return (
        <div className={styles.main} >
            <div className={styles.heading}>
                <h1>Our Board</h1>
            </div>
            <div className={styles.board}>
                {boardMembers.members.map((member, idx) => {
                    return (
                        <div className={styles.member}>
                            <div className={styles.memberIcon}>
                                <Image alt="icons" width={20} height={20} src={"/icons/" + member.icon + ".svg"} />
                            </div>
                            <div className={styles.memberDetails}>
                                <h1>{member.name} {member.surname}</h1>
                                <h2>{member.position}</h2>
                            </div>
                        </div>
                    )
                })}
            </div>

        </div>
    );

}

