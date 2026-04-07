import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
import os

load_dotenv()


def configurar_cloudinary():
    cloudinary.config(
        cloud_name="dwppdinff",
        api_key="964381363227975",
        api_secret="cO_ihijk54m-u4y4b_1EpAQr4F8",
        secure=True
    )


def subir_imagen_perfil(archivo, user_id):
    try:
        configurar_cloudinary()

        resultado = cloudinary.uploader.upload(
            archivo,
            folder=f"users/{user_id}",
            transformation=[
                {'width': 500, 'height': 500, 'crop': 'fill'},
                {'quality': 'auto'}
            ]
        )

        return resultado['public_id']

    except Exception as e:
        raise Exception(f"Error al subir a Cloudinary: {str(e)}")


def obtener_url_imagen(public_id, width=200, height=200):
    if not public_id:
        return None

    from cloudinary import CloudinaryImage
    img = CloudinaryImage(public_id)
    return img.build_url(width=width, height=height, crop='fill')
