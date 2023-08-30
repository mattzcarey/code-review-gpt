"use client";
import { Card } from "@radix-ui/themes";
import { ReactNode } from "react";
import { GiBrain, GiDatabase, GiOpenBook } from "react-icons/gi";

export const Features = (): JSX.Element => {
  return (
    <section className="my-20 text-center items-center justify-center gap-5">
      <div>
        <h1 className="text-5xl font-bold m-10">Features</h1>
      </div>
      <div className="flex flex-wrap gap-5 justify-center">
        <Feature
          icon={<GiBrain className="text-7xl w-full" />}
          title={"Autonomous Code Reviews"}
          description={
            "Uses Large Language Models (LLMs) to provide feedback on commits."
          }
        />
        <Feature
          icon={<GiDatabase className="text-7xl w-full" />}
          title={"Code Issue Detection"}
          description={
            "Detects issues such as exposed secrets and identifies code that could be more efficient."
          }
        />
        <Feature
          icon={<GiOpenBook className="text-7xl w-full" />}
          title={"Open Source"}
          description={"Free to use and contribute to. Join the community!"}
        />
      </div>
    </section>
  );
};

interface FeatureProps {
  icon?: ReactNode;
  title: string;
  description: string;
}

const Feature = ({ title, description, icon }: FeatureProps): JSX.Element => {
  return (
    <Card className="text-center p-10 max-w-xs flex flex-col gap-5 w-full">
      {icon}
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="pt-2">{description}</p>
    </Card>
  );
};
