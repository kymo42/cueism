import React from 'react';

type PostCardImageProps = {
	src?: string;
	alt: string;
};

export default function PostCardImage({ src, alt }: PostCardImageProps) {
	return (
		<div className="card-image">
			{src ? (
				<img
					src={src}
					alt={alt}
					loading="lazy"
					onError={(event) => {
						(event.currentTarget as HTMLImageElement).style.display = 'none';
					}}
				/>
			) : (
				<div className="card-image-placeholder" />
			)}
		</div>
	);
}
