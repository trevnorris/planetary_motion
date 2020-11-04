#include <node.h>

using v8::FunctionCallbackInfo;
using v8::Value;

void Method(const FunctionCallbackInfo<Value>& info) {
}


NODE_MODULE_INIT(/* exports, module, context */) {
  NODE_SET_METHOD(exports, "method", Method);
}
