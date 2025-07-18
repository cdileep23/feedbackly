
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

const Hero = () => {
  return (
    <section className="w-full py-12 md:py-24 ">
      <div className="flex justify-center px-4 sm:px-6">
        <div className="w-full max-w-7xl">
          <div className="flex flex-col items-center text-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Collect Feedback Effortlessly with{" "}
                <span className="text-primary">Feedbackly</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Create beautiful forms in minutes. Get responses without
                requiring users to sign up. Perfect for surveys, contact forms,
                and more.
              </p>
            </div>
            <div className="mt-6 space-x-4">
              <Link to="/admin/dashboard">
                <Button size="lg">Create Your Form</Button>
              </Link>
             
            </div>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "No Login Required",
                description:
                  "Users can submit forms without creating an account, increasing response rates.",
                icon: (
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                ),
              },
              {
                title: "Real-time Results",
                description:
                  "View responses as they come in with our intuitive dashboard.",
                icon: (
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                ),
              },
              {
                title: "Customizable Forms",
                description:
                  "Design forms that match your brand with our easy-to-use builder.",
                icon: (
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                ),
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center space-y-2 rounded-lg border p-6 text-center"
              >
                <div className="rounded-full bg-primary/10 p-3">
                  {feature.icon}
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
