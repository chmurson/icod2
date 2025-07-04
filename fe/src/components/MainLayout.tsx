import type { FC, PropsWithChildren } from "react";
import headerCropppedUrl from "../../public/header-cropped.jpg";

export const MainLayout: FC<PropsWithChildren> = ({ children }) => {
	return (
		<div>
			<HeaderImage />
			<ContentCard>{children}</ContentCard>
		</div>
	);
};

const ContentCard: FC<PropsWithChildren> = ({ children }) => {
	return (
		<div className="max-w-5xl mx-auto px-4 -mt-20 w-full">
			<div className="bg-white shadow-md rounded-lg p-6 px-24 max-md:px-8">
				{children}
			</div>
		</div>
	);
};

const HeaderImage: FC = () => {
	return (
		<div
			style={{
				backgroundImage: `url(${headerCropppedUrl})`,
			}}
			className="
				  b-image
          w-full
           h-64
           shadow
           bg-center
           bg-[length:auto_256px]
        "
		/>
	);
};
