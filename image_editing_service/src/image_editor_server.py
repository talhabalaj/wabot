from concurrent import futures
import logging
import os
import grpc
from image_editor.processors import grades_image_processsor

from image_editor_pb2_grpc import ImageEditorServicer, add_ImageEditorServicer_to_server
from image_editor_pb2 import GradesResponse

class ImageEditorServer(ImageEditorServicer):
  def Grades(self, request, context):
    return GradesResponse(image=grades_image_processsor(request.text1, request.text2))


def serve():
  server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
  add_ImageEditorServicer_to_server(ImageEditorServer(), server)
  server.add_insecure_port(f"[::]:{os.getenv('PORT', '50051')}")
  server.start()
  server.wait_for_termination()


if __name__ == '__main__':
  logging.basicConfig()
  serve()