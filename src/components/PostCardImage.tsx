import React from 'react';

type PostCardImageProps = {
	src?: string;
	alt: string;
};

export default function PostCardImage({ src, alt }: PostCardImageProps) {
	if (!src) return null;

	return (
		<div className="card-image">
			<img
				src={src}
				alt={alt}
				loading="lazy"
				onError={(event) => {
					(event.currentTarget as HTMLImageElement).style.display = 'none';
				}}
			/>
		</div>
	);
}
