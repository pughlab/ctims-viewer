package ctimsviewer;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ApiController {

	@Value("${CTIMS_VIEWER_API_VERSION}")
    private String CTIMS_VIEWER_API_VERSION;

	@GetMapping(path = "/info")
	public Map<String, String> info() {

	Map<String, String> response = new HashMap<>();
    response.put("CTIMS API version", CTIMS_VIEWER_API_VERSION);
    return response;
	}
}
