import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";

import { cn } from "@/lib/utils";
import aboutBenefits from "@/public/data/about-benefits.json";
import Image from "next/image";

interface CardsProps extends React.HTMLProps<HTMLDivElement> {}

const Cards: React.FC<CardsProps> = ({ ...props }) => {
  let icons_path = "/images/icons/";

  return (
    <div
      className={cn(
        "container flex flex-row flex-wrap justify-around md:flex-nowrap",
        props.className,
      )}
    >
      {aboutBenefits.cards.map((benefit, index) => {
        return (
          <Card className="m-4 w-full" key={index}>
            <CardHeader className="p-16 text-center">
              <CardTitle className="mb-6 mt-4 self-center">
                <Image
                  src={icons_path + benefit.icon}
                  alt={benefit.icon}
                  width={36}
                  height={36}
                />
              </CardTitle>

              <CardTitle className="text-2xl">
                {benefit.titleUp}
                <br />
                {benefit.titleDown}
              </CardTitle>

              <CardDescription>{benefit.description}</CardDescription>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
};

export default Cards;
